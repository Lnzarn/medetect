import { supabase } from "@/lib/supabase";
import { getDB } from "./client";

const SYNC_KEY = "last_synced_probs";
let _syncInProgress = false;

interface ProbRow {
  disease: string;
  symptom: string;
  probability: number;
}

export async function syncDiseaseData(force = false): Promise<void> {
  if (_syncInProgress) return;
  _syncInProgress = true;

  const db = await getDB();

  if (!force) {
    const meta = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_meta WHERE key = ?`,
      SYNC_KEY,
    );

    if (meta?.value) {
      const lastSynced = new Date(meta.value);
      const hoursSince = (Date.now() - lastSynced.getTime()) / 1000 / 60 / 60;
      const intervalHours = await getSyncIntervalHours(db);

      if (hoursSince < intervalHours) {
        console.log(
          `Skipped - last synced ${hoursSince.toFixed(1)}hrs ago (interval: ${intervalHours}h)`,
        );
        return;
      }
    }
  }

  console.log("Fetching disease data from Supabase...");

  const data = await fetchAllRows();

  if (data.length === 0) {
    console.warn("No data returned from Supabase");
    return;
  }

  console.log(`Writing ${data.length} rows to SQLite...`);

  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM disease_symptom_probs`);

    for (const row of data) {
      await db.runAsync(
        `INSERT INTO disease_symptom_probs (disease, symptom, probability)
         VALUES (?, ?, ?)`,
        row.disease,
        row.symptom,
        row.probability,
      );
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
      SYNC_KEY,
      new Date().toISOString(),
    );
  });

  console.log(`Done - ${data.length} rows saved to SQLite`);
}

async function fetchAllRows(): Promise<ProbRow[]> {
  const PAGE_SIZE = 1000;
  let allRows: ProbRow[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("disease_symptom_probs")
      .select("disease, symptom, probability")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...(data as ProbRow[])];
    hasMore = data.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  console.log(`Total fetched: ${allRows.length} rows`);
  return allRows;
}

export async function getLastSynced(): Promise<string | null> {
  const db = await getDB();
  const meta = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = ?`,
    SYNC_KEY,
  );
  return meta?.value ?? null;
}

// Options: "12h" | "24h" (default) | "72h" | "168h" (1 week) | "720h" (1 month)
async function getSyncIntervalHours(db?: any): Promise<number> {
  const resolvedDb = db ?? (await getDB());
  const row = await resolvedDb.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = ?`,
    "sync_interval",
  );
  const map: Record<string, number> = {
    "12h": 12,
    "24h": 24,
    "72h": 72,
    "168h": 168,
    "720h": 720,
  };
  return map[row?.value ?? "24h"] ?? 24;
}

export async function canSync(): Promise<{
  can: boolean;
  lastSynced: string | null;
  intervalHours: number;
}> {
  const last = await getLastSynced();
  const intervalHours = await getSyncIntervalHours();
  if (!last) return { can: true, lastSynced: null, intervalHours };

  const lastDate = new Date(last);
  const hoursSince = (Date.now() - lastDate.getTime()) / 1000 / 60 / 60;
  return { can: hoursSince >= intervalHours, lastSynced: last, intervalHours };
}

export async function getPreference(key: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = ?`,
    key,
  );
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
    key,
    value,
  );
}

export async function forceSync(): Promise<void> {
  return syncDiseaseData(true); // force = true skips the 24hr check
}

export async function getSymptomsForDisease(
  disease: string,
): Promise<{ symptom: string; probability: number }[]> {
  const db = await getDB();
  return db.getAllAsync<{ symptom: string; probability: number }>(
    `SELECT symptom, probability
     FROM disease_symptom_probs
     WHERE disease = ?
     ORDER BY probability DESC`,
    disease,
  );
}

export async function getAllDiseases(): Promise<string[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ disease: string }>(
    `SELECT DISTINCT disease FROM disease_symptom_probs ORDER BY disease`,
  );
  return rows.map((r) => r.disease);
}

export async function getSymptomProbability(
  disease: string,
  symptom: string,
): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ probability: number }>(
    `SELECT probability FROM disease_symptom_probs
     WHERE disease = ? AND symptom = ?`,
    disease,
    symptom,
  );
  return row?.probability ?? 0.01;
}

export async function getAllDiseaseSymptoms(): Promise<
  Record<string, Record<string, number>>
> {
  const db = await getDB();
  const rows = await db.getAllAsync<{
    disease: string;
    symptom: string;
    probability: number;
  }>(`SELECT disease, symptom, probability FROM disease_symptom_probs`);

  const result: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    if (!result[row.disease]) result[row.disease] = {};
    result[row.disease][row.symptom] = row.probability;
  }

  return result;
}
