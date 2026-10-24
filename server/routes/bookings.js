import { Router } from 'express';
import db from '../db.js';
import { mailer, escapeHtml, nl2br } from '../mailer.js';
import { slotsForDate } from '../slots.js';

const router = Router();

const MUSIC_OPTIONS = ['major', 'minor', 'undecided', 'neither'];
const SECRETARY_EMAIL = 'ajduan29@colby.edu'; // "zcpale29@colby.edu"
const clip = (s, max) => String(s ?? '').trim().slice(0, max);
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL; 

// POST /api/bookings
router.post('/', async (req, res) => {
  const { start, name, email, musicMajor, toAccomplish, equipment, referenceTracks } = req.body ?? {};
  
  const STUDIO_EMAIL = process.env.STUDIO_EMAIL;

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

  const when = start.replace('T', ' at ');
  const details = `
    <p><b>When:</b> ${when} (${slot.length} hr)<br>
       <b>Music major/minor:</b> ${cleanMajor}<br>
       <b>Goal:</b> ${nl2br(cleanGoal)}<br>
       <b>Equipment:</b> ${nl2br(cleanEquipment) || 'None'}<br>
       <b>Reference tracks:</b> ${nl2br(cleanRefs) || 'None'}</p>`;

  try {
    await mailer.sendMail({
      from: `Studio at Colby <${STUDIO_EMAIL}>`,
      replyTo: STUDIO_EMAIL,
      to: cleanEmail,
      cc: [slot.managerEmail || process.env.GMAIL_USER, SECRETARY_EMAIL],
      subject: 'Your studio booking is confirmed',
      html: `<p>Hi ${escapeHtml(cleanName)},</p>
             <p>You're booked for <b>${when}</b> with ${escapeHtml(slot.manager)}.</p>
             ${details}`,
    });
  } catch (e) {
    console.error('Email failed:', e);
  }

  res.status(201).json({ ok: true });

  if (!GOOGLE_SCRIPT_URL) return console.warn('GOOGLE_SCRIPT_URL not set; skipping Sheets');

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // avoids Apps Script's preflight issues
        body: JSON.stringify({
            timeStamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
            start,
            name: cleanName,
            email: cleanEmail,
            musicMajor: cleanMajor,
            toAccomplish: cleanGoal,
            equipment: cleanEquipment,
            referenceTracks: cleanRefs,
            manager: slot.manager,
        }),
        redirect: 'follow',
        });

        const text = await response.text();
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = null; }

        if (!response.ok || parsed?.result !== 'success') {
        console.error('Sheets logging failed:', response.status, text.slice(0, 300));
        }
    } catch (e) {
        console.error('Sheets request failed:', e.message);
    }
});


export default router;