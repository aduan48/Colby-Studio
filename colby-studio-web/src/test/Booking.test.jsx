import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Booking from '../pages/Booking';

/* ---------- Test data ---------- */

// Pretend today is Tue, Nov 10, 2026 so the calendar is the same every run
const TODAY = new Date(2026, 10, 10, 12);
const MONDAY = new Date(2026, 10, 16); // a bookable day

const SLOTS = [
  { start: '2026-11-16T10:00:00', manager: 'Henry', available: true },
  { start: '2026-11-16T14:00:00', manager: 'Anna', available: false },
];

/** Fake backend: answers /api/availability and /api/bookings */
function mockApi({ bookingOk = true, bookingBody = { ok: true }, slots = SLOTS } = {}) {
  const fetchMock = vi.fn(async (url) => {
    if (url.startsWith('/api/availability')) {
      return { ok: true, json: async () => slots };
    }
    if (url === '/api/bookings') {
      return { ok: bookingOk, json: async () => bookingBody };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Start the page with a day already chosen (skips clicking the calendar) */
function saveDay(date) {
  localStorage.setItem('booking:day', JSON.stringify(date.toISOString()));
}

/** Reads back what the component saved in localStorage */
function saved(key) {
  return JSON.parse(localStorage.getItem(key));
}

/* ---------- Setup ---------- */

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] }); // only freeze the clock, keep real timers
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/* ---------- Tests ---------- */

describe('Booking page', () => {
  it('shows the calendar and no form until a day is picked', () => {
    mockApi();
    render(<Booking />);

    expect(screen.getByRole('heading', { name: /book a session/i })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it('loads availability for the day you click', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<Booking />);

    await user.click(screen.getByRole('button', { name: /november 16/i }));

    expect(fetchMock).toHaveBeenCalledWith('/api/availability?date=2026-11-16');
    expect(screen.getByRole('heading', { name: 'Monday, November 16' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /10:00/ })).toBeEnabled();
  });

  it('greys out slots that are already taken', async () => {
    mockApi();
    saveDay(MONDAY);
    render(<Booking />);

    expect(await screen.findByRole('button', { name: /14:00/ })).toBeDisabled();
  });

  it('says so when a day has no times', async () => {
    mockApi({ slots: [] });
    saveDay(MONDAY);
    render(<Booking />);

    expect(await screen.findByText(/no times available/i)).toBeInTheDocument();
  });

  it("doesn't let you pick days in the past or after the cutoff", () => {
    mockApi();
    render(<Booking />);

    expect(screen.getByRole('button', { name: /november 9/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /november 16/i })).toBeEnabled();
  });

  it('forgets a saved day that has already passed', async () => {
    mockApi();
    saveDay(new Date(2026, 10, 2)); // before TODAY
    render(<Booking />);

    await waitFor(() => expect(saved('booking:day')).toBeNull());
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('shows the form after choosing a time', async () => {
    mockApi();
    saveDay(MONDAY);
    const user = userEvent.setup();
    render(<Booking />);

    await user.click(await screen.findByRole('button', { name: /10:00/ }));

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Nov 16 at 10:00' })).toBeInTheDocument();
  });

  it('sends the booking and resets the session answers on success', async () => {
    const fetchMock = mockApi();
    saveDay(MONDAY);
    const user = userEvent.setup();
    render(<Booking />);

    await user.click(await screen.findByRole('button', { name: /10:00/ }));
    await user.type(screen.getByLabelText(/name/i), 'Alex');
    await user.type(screen.getByLabelText(/email/i), 'alex@colby.edu');
    await user.click(screen.getByLabelText('Major'));
    await user.type(screen.getByLabelText(/accomplish/i), 'Record a demo');
    await user.click(screen.getByRole('button', { name: /^book nov 16/i }));

    // the request body has the slot and every form field
    const [, options] = fetchMock.mock.calls.find(([url]) => url === '/api/bookings');
    expect(JSON.parse(options.body)).toEqual({
      start: '2026-11-16T10:00:00',
      name: 'Alex',
      email: 'alex@colby.edu',
      musicMajor: 'major',
      toAccomplish: 'Record a demo',
      equipment: '',
      referenceTracks: '',
    });

    expect(await screen.findByText(/booked! check your email/i)).toBeInTheDocument();

    // name/email/major are kept for next time, session answers are cleared
    expect(saved('booking:form')).toMatchObject({
      name: 'Alex',
      email: 'alex@colby.edu',
      musicMajor: 'major',
      toAccomplish: '',
    });
    expect(saved('booking:day')).toBeNull();
    expect(saved('booking:selected')).toBeNull();
  });

  it('shows the server error and refreshes the slots when booking fails', async () => {
    const fetchMock = mockApi({ bookingOk: false, bookingBody: { error: 'That slot was just taken.' } });
    saveDay(MONDAY);
    const user = userEvent.setup();
    render(<Booking />);

    await user.click(await screen.findByRole('button', { name: /10:00/ }));
    await user.type(screen.getByLabelText(/name/i), 'Alex');
    await user.type(screen.getByLabelText(/email/i), 'alex@colby.edu');
    await user.type(screen.getByLabelText(/accomplish/i), 'Record a demo');
    await user.click(screen.getByRole('button', { name: /^book nov 16/i }));

    expect(await screen.findByText('That slot was just taken.')).toBeInTheDocument();

    const availabilityCalls = fetchMock.mock.calls.filter(([url]) => url.startsWith('/api/availability'));
    expect(availabilityCalls).toHaveLength(2); // once on load, once after the failure
  });

  it('remembers a half-filled form after a reload', async () => {
    mockApi();
    saveDay(MONDAY);
    localStorage.setItem('booking:selected', JSON.stringify('2026-11-16T10:00:00'));
    localStorage.setItem('booking:form', JSON.stringify({
      name: 'Alex', email: '', musicMajor: 'minor', toAccomplish: '', equipment: '', referenceTracks: '',
    }));
    render(<Booking />);

    expect(await screen.findByLabelText(/name/i)).toHaveValue('Alex');
    expect(screen.getByLabelText('Minor')).toBeChecked();
  });
});
