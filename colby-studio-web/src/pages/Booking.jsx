import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';
import '../styles/Booking.css';

const MUSIC_OPTIONS = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'undecided', label: 'Undecided' },
  { value: 'neither', label: 'Neither' },
];

/** Like useState, but loads from and saves to localStorage */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export default function Booking() {
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState('');

  const [dayStr, setDayStr] = useLocalStorage('booking:day', null);
  const day = dayStr ? new Date(dayStr) : undefined;

  const [selected, setSelected] = useLocalStorage('booking:selected', null);
  const [form, setForm] = useLocalStorage('booking:form', {
    name: '',
    email: '',
    musicMajor: 'undecided',
    toAccomplish: '',
    equipment: '',
    referenceTracks: '',
  });

  /** Fetches open time slots for the chosen day, and drops a saved time that's no longer free */
  const loadSlots = async (d) => {
    const res = await fetch(`/api/availability?date=${format(d, 'yyyy-MM-dd')}`);
    const data = await res.json();
    setSlots(data);
    setSelected((sel) => (data.some((s) => s.start === sel && s.available) ? sel : null));
  };

  /** On first load, forget a saved day that's already in the past */
  useEffect(() => {
    const today = new Date(new Date().toDateString()); // midnight today
    if (day && day < today) {
      setDayStr(null);
      setSelected(null);
    }
  }, []);

  /** Reload slots whenever the day changes (including the restored day on reload) */
  useEffect(() => {
    if (day) loadSlots(day);
  }, [dayStr]); // depend on the string; a new Date object is created every render

  /** Only clear the chosen time when the user actually picks a new day */
  const pickDay = (d) => {
    setDayStr(d ? d.toISOString() : null);
    setSelected(null);
    setStatus('');
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const book = async (e) => {
    e.preventDefault();
    setStatus('Booking…');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start: selected, ...form }),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus('Booked! Check your email.');
      setSelected(null);
      setDayStr(null);
      // keep name/email/major for next time, clear the session-specific answers
      setForm((f) => ({ ...f, toAccomplish: '', equipment: '', referenceTracks: '' }));
    } else {
      setStatus(data.error);
      loadSlots(day); // refresh so a just-taken slot greys out
    }
  };

  return (
    <div className="booking-page">
      <div className="booking">
        <h2 className="booking__title">Book a session</h2>
        <p className="booking__subtitle">Pick a day, choose a time, and tell us about your session.</p>

        <div className="booking__calendar">
          <DayPicker
            mode="single"
            selected={day}
            onSelect={pickDay}
            defaultMonth={day}
            disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
          />
        </div>

        {day && (
          <>
            <h3 className="booking__section">{format(day, 'EEEE, MMMM d')}</h3>
            <div className="booking__slots">
              {slots.length === 0 && <p className="booking__empty">No times available.</p>}
              {slots.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  className={`slot ${selected === s.start ? 'slot--selected' : ''}`}
                  disabled={!s.available}
                  onClick={() => setSelected(s.start)}
                >
                  {s.start.slice(11, 16)}
                </button>
              ))}
            </div>
          </>
        )}

        {day && selected && (
          <form className="booking__form" onSubmit={book}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" placeholder="Your name" required value={form.name} onChange={handleChanges} />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" placeholder="you@colby.edu" required value={form.email} onChange={handleChanges} />
              </div>
            </div>

            <fieldset className="field">
              <legend>Are you a music major or minor?</legend>
              <div className="radio-group">
                {MUSIC_OPTIONS.map((o) => (
                  <label key={o.value} className="chip">
                    <input
                      type="radio"
                      name="musicMajor"
                      value={o.value}
                      checked={form.musicMajor === o.value}
                      onChange={handleChanges}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="toAccomplish">What would you like to accomplish in this session?</label>
              <span className="hint">Include the instrumentation we'll be recording and the size of your ensemble, if applicable.</span>
              <textarea id="toAccomplish" name="toAccomplish" rows={3} placeholder="Your response" required value={form.toAccomplish} onChange={handleChanges} />
            </div>

            <div className="field">
              <label htmlFor="equipment">Do you need any equipment that may not be in the studio?</label>
              <span className="hint">Optional. If so, please specify.</span>
              <input id="equipment" name="equipment" placeholder="Your response" value={form.equipment} onChange={handleChanges} />
            </div>

            <div className="field">
              <label htmlFor="referenceTracks">Reference tracks</label>
              <span className="hint">Optional. Links or song names that show the sound you're going for.</span>
              <textarea id="referenceTracks" name="referenceTracks" rows={2} placeholder="Your response" value={form.referenceTracks} onChange={handleChanges} />
            </div>

            <button type="submit" className="booking__submit">
              Book {format(day, 'MMM d')} at {selected.slice(11, 16)}
            </button>
          </form>
        )}

        {status && <p className="booking__status">{status}</p>}
      </div>
    </div>
  );
}
