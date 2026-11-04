import { Router } from 'express';
import { mailer, escapeHtml, nl2br } from '../mailer.js';

const router = Router();

const clip = (s, max) => String(s ?? '').trim().slice(0, max);
const SECRETARY_EMAIL = 'ajduan29@colby.edu'; //process.env.SECRETARY_EMAIL// "zcpale29@colby.edu"

router.post('/', async (req, res) => {
    const { name, email, message } = req.body ?? {};

    const cleanName = clip(name, 100);
    const cleanEmail = clip(email, 200);
    const cleanMessage = clip(message, 1000);

    if (!cleanName) return res.status(400).json({ error: 'Please enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return res.status(400).json({ error: 'Please enter a valid email' });
    
    const details = `
        <p><b>Name:</b> ${escapeHtml(cleanName)}<br>
        <b>Email:</b> ${escapeHtml(cleanEmail)}<br>
        <b>Message:</b> ${nl2br(cleanMessage)}</p>
    `;

    try {
        await mailer.sendMail({
            from: `Studio at Colby <${process.env.STUDIO_EMAIL}>`,
            replyTo: process.env.STUDIO_EMAIL,
            to: cleanEmail,
            cc: [process.env.STUDIO_EMAIL, SECRETARY_EMAIL],
            subject: `Contact Form Submission from ${cleanName}`,
            html: `<p>${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)}) has sent a message through the contact form.</p>
                ${details}`,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Server error' });
    }

    res.status(201).json({ ok: true });

});

export default router;