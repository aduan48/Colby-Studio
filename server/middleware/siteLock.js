import express from 'express';
import crypto from 'crypto';

/* Temporary password lock for the whole site. Delete this file and its two lines in index.js at launch. */

const PASSWORD = process.env.SITE_PASSWORD;
if (!PASSWORD) throw new Error('admin_password is missing from .env');

const GATE_COOKIE = 'site_gate';
const hash = (s) => crypto.createHash('sha256').update(String(s)).digest();
const GATE_TOKEN = hash(`gate:${PASSWORD}`).toString('hex'); // cookie value; the password itself is never sent back

/** Compares without leaking timing info */
const safeEqual = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));

const hasAccess = (req) =>
  (req.headers.cookie || '')
    .split(';')
    .some((c) => c.trim() === `${GATE_COOKIE}=${GATE_TOKEN}`);

/** GET checks the cookie, POST checks the password and sets the cookie */
export const unlockRoutes = express.Router();

unlockRoutes.get('/', (req, res) => res.json({ ok: hasAccess(req) }));

unlockRoutes.post('/', (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || !safeEqual(password, PASSWORD)) {
    return res.status(401).json({ ok: false });
  }
  res.cookie(GATE_COOKIE, GATE_TOKEN, {
    httpOnly: true,                                  // JS can't read it
    secure: process.env.NODE_ENV === 'production',   // HTTPS only in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,                // 30 days
  });
  res.json({ ok: true });
});

/** Blocks any route mounted after it unless the visitor is unlocked */
export const requireUnlock = (req, res, next) =>
  hasAccess(req) ? next() : res.status(401).json({ error: 'Site is locked' });