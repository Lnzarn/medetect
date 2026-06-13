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
`;
