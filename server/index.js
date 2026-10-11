import express from 'express';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load server/.env no matter where the server is started from
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
app.use(express.json());

// Keep the database file inside server/
const db = new Database(fileURLToPath(new URL('./bookings.db', import.meta.url)));
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TEXT NOT NULL UNIQUE,   -- prevents double booking
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Gmail sender
const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

mailer.verify()
  .then(() => console.log('Gmail ready'))
  .catch(e => console.error('Gmail login failed:', e.message));

// Prevent HTML injection in emails for security 
const escapeHtml = s => s.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// all open slots
const shifts = require("./shifts");
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// "2026-10-05" -> slots for that day
function slotsForDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);                     // local time, avoids the UTC bug
  if (date.getMonth() !== m - 1) return [];               // rejects dates like 2026-02-31

  const day = DAYS[date.getDay()];

  return shifts
    .filter(s => s.Day === day)
    .map(s => {
      const hh = String(s["Time-Start"]).padStart(2, "0");
      return {
        start: `${dateStr}T${hh}:00`,                     // e.g. "2026-10-05T20:00"
        length: s.Length,
        manager: s.Manager,
        managerEmail: s.Email,
      };
    });
}

// GET /api/availability?date=2026-10-05
//returns a json with all session dates from that day and wether or not it is already available or not
app.get('/api/availability', (req, res) => {
  const { date } = req.query;

  //first test if the date is a available date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Bad date' }); 

  const booked = new Set(
    db.prepare('SELECT start_time FROM bookings WHERE start_time LIKE ?')//sql query
      .all(`${date}%`).map(r => r.start_time)
  );
  res.json(slotsForDate(date).map(slot => ({
    start: slot.start,
    length: slot.length,
    manager: slot.manager,
    available: !booked.has(slot.start),
  })));
});

// POST /api/bookings  { start, name, email }
app.post('/api/bookings', async (req, res) => {
  const date = start?.slice(0, 10);
  const slot = date ? slotsForDate(date).find(s => s.start === start) : null;

  if (!slot || !name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? '')) {
    return res.status(400).json({ error: 'Invalid booking details' });
  }

  const cleanName = name.trim();

  try {
    db.prepare('INSERT INTO bookings (start_time, name, email) VALUES (?, ?, ?)')
      .run(start, cleanName, email);
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
      return res.status(409).json({ error: 'That slot was just taken' });
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }

  // Booking is saved; a failed email shouldn't undo it
  try {
    await mailer.sendMail({
      from: `Colby Studio <${process.env.GMAIL_USER}>`,
      to: email,
      bcc: process.env.GMAIL_USER,
      subject: 'Your booking is confirmed',
      html: `<p>Hi ${escapeHtml(cleanName)},</p>
             <p>You're booked for <b>${start.replace('T', ' at ')}</b>.</p>`,
    });
  } catch (e) {
    console.error('Email failed:', e);
  }

  res.status(201).json({ ok: true });
});

app.listen(3001, () => console.log('API on :3001'));