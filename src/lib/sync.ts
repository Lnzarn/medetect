// src/db/sync.ts
import { supabase } from "@/lib/supabase";
import { getDB } from "./client";

const SYNC_KEY = "last_synced_probs";

interface ProbRow {
  disease: string;
  symptom: string;
  probability: number;
}

export async function syncDiseaseData(force = false): Promise<void> {
  const db = await getDB();

  if (!force) {
    const meta = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_meta WHERE key = ?`,
      SYNC_KEY,
    );

    if (meta?.value) {
      const lastSynced = new Date(meta.value);
      const hoursSince = (Date.now() - lastSynced.getTime()) / 1000 / 60 / 60;

      if (hoursSince < 24) {
        console.log(`Skipped - last synced ${hoursSince.toFixed(1)}hrs ago`);
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
