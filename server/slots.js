import shifts from './shifts.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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