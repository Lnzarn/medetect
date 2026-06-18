export const CREATE_TABLES = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS disease_symptom_probs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    disease     TEXT NOT NULL,
    symptom     TEXT NOT NULL,
    probability REAL NOT NULL,
    UNIQUE(disease, symptom)
  );

  CREATE TABLE IF NOT EXISTS sync_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS assessment_history (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id        TEXT UNIQUE,
    user_id          TEXT NOT NULL,
    assessed_at      TEXT NOT NULL,
    category         TEXT NOT NULL,
    top_matches      TEXT NOT NULL,
    is_emergency     INTEGER NOT NULL DEFAULT 0,
    stopped_reason   TEXT NOT NULL,
    questions_asked  INTEGER NOT NULL,
    confidence_level TEXT NOT NULL DEFAULT 'normal',
    synced           INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS medications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id   TEXT UNIQUE,
    user_id     TEXT NOT NULL,
    name        TEXT NOT NULL,
    info        TEXT NOT NULL DEFAULT '',
    time        TEXT NOT NULL,
    start_date  TEXT NOT NULL,
    end_date    TEXT,
    created_at  TEXT NOT NULL,
    synced      INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS medication_logs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id      TEXT UNIQUE,
    medication_id  INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id        TEXT NOT NULL,
    log_date       TEXT NOT NULL,
    taken          INTEGER NOT NULL DEFAULT 1,
    taken_at       TEXT,
    synced         INTEGER NOT NULL DEFAULT 0,
    UNIQUE(medication_id, log_date)
  );
`;
