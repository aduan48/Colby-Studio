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

// Business rules: 9am–5pm, 30-min slots (business's local time)
const OPEN = 9, CLOSE = 17, SLOT_MIN = 240;


//gets all the slots for a selcted date
function slotsForDate(date) {
  const slots = [];
  for (let m = OPEN * 60; m < CLOSE * 60; m += SLOT_MIN) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0'); //hours
    const mm = String(m % 60).padStart(2, '0'); //minutes
    slots.push(`${date}T${hh}:${mm}`); //makes ths lots 
  }
  return slots;
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
  res.json(slotsForDate(date).map(start => 
    ({ start, available: !booked.has(start) })
  ));
});

// POST /api/bookings  { start, name, email }
app.post('/api/bookings', async (req, res) => {
  const { start, name, email } = req.body ?? {};
  const date = start?.slice(0, 10);

  if (!date || !slotsForDate(date).includes(start) || !name?.trim() ||
      !/^\S+@\S+\.\S+$/.test(email ?? '')) {
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