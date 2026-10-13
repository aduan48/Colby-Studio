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

// Add the new columns to an existing database (safe to run every startup)
const existingCols = db.prepare('PRAGMA table_info(bookings)').all().map(c => c.name);
for (const [col, type] of [
  ['music_major', 'TEXT'],
  ['to_accomplish', 'TEXT'],
  ['equipment', 'TEXT'],
  ['reference_tracks', 'TEXT'],
]) {
  if (!existingCols.includes(col)) db.exec(`ALTER TABLE bookings ADD COLUMN ${col} ${type}`);
}

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
import shifts from "./shifts.js";
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
const MUSIC_OPTIONS = ['major', 'minor', 'undecided', 'neither'];
const clip = (s, max) => String(s ?? '').trim().slice(0, max); // trims + caps length

// POST /api/bookings  { start, name, email, musicMajor, toAccomplish, equipment, referenceTracks }
app.post('/api/bookings', async (req, res) => {
  const { start, name, email, musicMajor, toAccomplish, equipment, referenceTracks } = req.body ?? {};

  const date = typeof start === 'string' ? start.slice(0, 10) : null;
  const slot = date ? slotsForDate(date).find(s => s.start === start) : null;

  const cleanName = clip(name, 100);
  const cleanEmail = clip(email, 200);
  const cleanGoal = clip(toAccomplish, 2000);
  const cleanEquipment = clip(equipment, 1000);
  const cleanRefs = clip(referenceTracks, 1000);
  const cleanMajor = MUSIC_OPTIONS.includes(musicMajor) ? musicMajor : 'undecided';

  if (!slot) return res.status(400).json({ error: 'That time slot does not exist' });
  if (new Date(start) < new Date()) return res.status(400).json({ error: 'That time has already passed' });
  if (!cleanName) return res.status(400).json({ error: 'Please enter your name' });
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (!cleanGoal) return res.status(400).json({ error: 'Please describe what you want to accomplish' });

  try {
    db.prepare(`
      INSERT INTO bookings (start_time, name, email, music_major, to_accomplish, equipment, reference_tracks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(start, cleanName, cleanEmail, cleanMajor, cleanGoal, cleanEquipment, cleanRefs);
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
      return res.status(409).json({ error: 'That slot was just taken. Please pick another time.' });
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }

  // Booking is saved; a failed email shouldn't undo it
  const when = start.replace('T', ' at ');
  const nl2br = s => escapeHtml(s).replace(/\n/g, '<br>');
  const details = `
    <p><b>When:</b> ${when} (${slot.length} hr)<br>
       <b>Music major/minor:</b> ${cleanMajor}<br>
       <b>Goal:</b> ${nl2br(cleanGoal)}<br>
       <b>Equipment:</b> ${nl2br(cleanEquipment) || 'None'}<br>
       <b>Reference tracks:</b> ${nl2br(cleanRefs) || 'None'}</p>`;

  try {
    await mailer.sendMail({
      from: `Colby Studio <${process.env.GMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Your studio booking is confirmed',
      html: `<p>Hi ${escapeHtml(cleanName)},</p>
             <p>You're booked for <b>${when}</b> with ${escapeHtml(slot.manager)}.</p>
             ${details}`,
    });

    // Let the studio manager on that shift know what's coming
    await mailer.sendMail({
      from: `Colby Studio <${process.env.GMAIL_USER}>`,
      to: slot.managerEmail || process.env.GMAIL_USER,
      cc: process.env.GMAIL_USER,
      replyTo: cleanEmail,
      subject: `New booking: ${cleanName}, ${when}`,
      html: `<p><b>${escapeHtml(cleanName)}</b> (${escapeHtml(cleanEmail)}) booked a session.</p>${details}`,
    });
  } catch (e) {
    console.error('Email failed:', e);
  }

  res.status(201).json({ ok: true });
});

app.listen(3001, () => console.log('API on :3001'));