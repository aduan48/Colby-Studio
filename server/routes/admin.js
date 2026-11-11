import express from 'express';
import db from '../db.js'; // your better-sqlite3 instance
import { requireAdmin } from '../middleware/adminAuth.js';

/**
 * Tabs shown on the admin page -> real table names.
 * Only these tables can be reached; table names can't be SQL parameters,
 * so this allowlist is what keeps the queries safe.
 */
const TABLES = {
  sessions: 'bookings',
};

const router = express.Router();
router.use(requireAdmin); // every route below needs an admin session

const tableFor = (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) res.status(404).json({ error: 'Unknown type' });
  return table;
};

router.get('/types', (req, res) => res.json(Object.keys(TABLES)));

router.get('/:type', (req, res) => {
  const table = tableFor(req, res);
  if (!table) return;
  res.json(db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all());
});

router.get('/:type/:id', (req, res) => {
  const table = tableFor(req, res);
  if (!table) return;
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
  row ? res.json(row) : res.status(404).json({ error: 'Not found' });
});

router.delete('/:type/:id', (req, res) => {
  const table = tableFor(req, res);
  if (!table) return;
  const { changes } = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
  changes ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;