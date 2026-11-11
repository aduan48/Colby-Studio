import express from 'express';
import crypto from 'crypto';

/* Admin login: random session tokens kept in memory (everyone is signed out on server restart). */

const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('admin_password is missing from .env');

const COOKIE = 'admin_session';
const SESSION_MS = 8 * 60 * 60 * 1000;   // 8 hours
const MAX_ATTEMPTS = 5;                  // per IP...
const WINDOW_MS = 15 * 60 * 1000;        // ...per 15 minutes

const sessions = new Map(); // token -> expiry time
const attempts = new Map(); // ip -> { count, resetAt }

const hash = (s) => crypto.createHash('sha256').update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));

const getToken = (req) =>
  (req.headers.cookie || '').match(/(?:^|;\s*)admin_session=([a-f0-9]+)/)?.[1];

export const isAdmin = (req) => {
  const token = getToken(req);
  const expires = token && sessions.get(token);
  if (!expires) return false;
  if (expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
};

export const requireAdmin = (req, res, next) =>
  isAdmin(req) ? next() : res.status(401).json({ error: 'Not signed in' });

export const adminAuthRoutes = express.Router();

adminAuthRoutes.get('/session', (req, res) => res.json({ ok: isAdmin(req) }));

adminAuthRoutes.post('/login', (req, res) => {
  const now = Date.now();
  const entry = attempts.get(req.ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many attempts, try again later' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string' || !safeEqual(password, PASSWORD)) {
    const fresh = !entry || entry.resetAt <= now;
    attempts.set(req.ip, {
      count: fresh ? 1 : entry.count + 1,
      resetAt: fresh ? now + WINDOW_MS : entry.resetAt,
    });
    return res.status(401).json({ error: 'Wrong password' });
  }

  attempts.delete(req.ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, now + SESSION_MS);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MS,
  });
  res.json({ ok: true });
});

adminAuthRoutes.post('/logout', (req, res) => {
  sessions.delete(getToken(req));
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});