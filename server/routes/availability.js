import { Router } from 'express';
import db from '../db.js';
import { slotsForDate } from '../slots.js';

const router = Router();

// GET /api/availability?date=2026-10-05
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Bad date' });

  const booked = new Set(
    db.prepare('SELECT start_time FROM bookings WHERE start_time LIKE ?')
      .all(`${date}%`).map(r => r.start_time)
  );

  res.json(slotsForDate(date).map(slot => ({
    start: slot.start,
    length: slot.length,
    manager: slot.manager,
    available: !booked.has(slot.start),
  })));
});

export default router;