import { Router } from 'express';
import db from '../db.js';
import { slotsForDate } from '../slots.js';

const router = Router();

/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Returns every time slot for the given day and marks whether each one is still open.
 * Combines the studio's schedule (from slotsForDate) with existing bookings in the
 * database, so availability always reflects what's actually booked.
 *
 * Response:
 * [
 *   { start: "2026-11-20T13:00", length: 60, manager: "Jordan", available: true },
 *   { start: "2026-11-20T14:00", length: 60, manager: "Jordan", available: false }, // already booked
 *   ...
 * ]
 *
 * Responds with 400 if the date is missing or not in YYYY-MM-DD format.
 */
router.get('/', (req, res) => {
  const { date } = req.query; //reads the date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Bad date' }); //validates the dat format

  //gets the booking in the data base from that date in a set
  const booked = new Set(
    db.prepare('SELECT start_time FROM bookings WHERE start_time LIKE ?')
      .all(`${date}%`).map(r => r.start_time)
  );

  res.json(slotsForDate(date).map(slot => ({
    start: slot.start,
    length: slot.length,
    manager: slot.manager,
    available: !booked.has(slot.start), //shows true if the date is not in the db
  })));
});

export default router;