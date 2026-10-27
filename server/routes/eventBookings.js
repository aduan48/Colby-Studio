import { Router } from 'express';
import { mailer, escapeHtml, nl2br } from '../mailer.js';

const router = Router();

const clip = (s, max) => String(s ?? '').trim().slice(0, max);
const SECRETARY_EMAIL = 'ajduan29@colby.edu'; //process.env.SECRETARY_EMAIL// "zcpale29@colby.edu"

router.post('/', async (req, res) => {
  // TODO
  const { request_date, start_time, duration, name, email, group, toAccomplish, equipment, referenceTracks } = req.body ?? {};
  const date = typeof request_date === 'string' ? request_date.slice(0, 10) : null;

  const cleanName = clip(name, 100);
  const cleanEmail = clip(email, 200);
  const cleanGroup = clip(group, 100);
  const cleanGoal = clip(toAccomplish, 2000);
  const cleanEquipment = clip(equipment, 1000);
  const cleanRefs = clip(referenceTracks, 1000);

  if (new Date(request_date) < new Date()) return res.status(400).json({ error: 'That time has already passed' });
  if (!cleanName) return res.status(400).json({ error: 'Please enter your name' });
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (!cleanGoal) return res.status(400).json({ error: 'Please describe what you want to accomplish' });
  if (!cleanGroup) return res.status(400).json({ error: 'Please enter your group name' });

  const details = `
    <p><b>When:</b> ${request_date} ${start_time} (${duration} hr)<br>
       <b>Group:</b> ${cleanGroup}<br>
       <b>Goal:</b> ${nl2br(cleanGoal)}<br>
       <b>Equipment:</b> ${nl2br(cleanEquipment) || 'None'}<br>
       <b>Reference tracks:</b> ${nl2br(cleanRefs) || 'None'}</p>`;
  
  try {
    await mailer.sendMail({
      from: `Studio at Colby <${process.env.STUDIO_EMAIL}>`,
      replyTo: process.env.STUDIO_EMAIL,
      to: cleanEmail,
      cc: [process.env.GMAIL_USER, SECRETARY_EMAIL],
      subject: `${cleanGroup} Live Recording Request for ${request_date} ${start_time}`,
      html: `<p>${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)}) has requested a studio session on ${request_date} ${start_time}.</p>
        ${details}`,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
    
  res.status(201).json({ ok: true });

});

export default router;