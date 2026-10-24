import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const db = new Database(fileURLToPath(new URL('./bookings.db', import.meta.url)));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    music_major TEXT NOT NULL DEFAULT 'undecided',
    to_accomplish TEXT NOT NULL,
    equipment TEXT,
    reference_tracks TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;