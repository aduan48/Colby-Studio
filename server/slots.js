import shifts from './shifts.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Builds the list of bookable slots for a single date from the weekly shift schedule.
 *
 * shifts.js holds the studio's recurring weekly schedule, one entry per shift:
 *   { Manager: 'Jordan', Day: 'Mon',  Email: 'jordan@colby.edu', 'Time-Start': 14, Length: 1,}
 * This function finds the shifts that fall on the given date's weekday and turns each
 * one into a dated slot. It's the single source of truth for which slots exist: both
 * the availability route and the bookings route use it.
 *
 * @param {string} dateStr - A date in YYYY-MM-DD format, e.g. "2026-11-20"
 * @returns {Array<{ start: string, length: number, manager: string, managerEmail: string }>}
 *   Slots for that day, e.g.
 *   [{ start: "2026-11-20T14:00", length: 1, manager: "Jordan", managerEmail: "jordan@colby.edu" }]
 *   Returns an empty array if the date doesn't exist or no shifts fall on that weekday.
 */
export function slotsForDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1) return [];

  const day = DAYS[date.getDay()];
  return shifts
    .filter(s => s.Day === day)
    .map(s => ({
      start: `${dateStr}T${String(s['Time-Start']).padStart(2, '0')}:00`,
      length: s.Length,
      manager: s.Manager,
      managerEmail: s.Email,
    }));
}