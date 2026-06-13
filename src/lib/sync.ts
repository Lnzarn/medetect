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
  const { data, error } = await supabase
    .from("disease_symptom_probs")
    .select("disease, symptom, probability")
    .range(0, 9999);

  if (error) {
    console.error("Supabase fetch failed:", error.message);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn("No data returned from Supabase");
    return;
  }

  console.log(`Fetched ${data.length} rows - writing to SQLite...`);

  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM disease_symptom_probs`);

    for (const row of data as ProbRow[]) {
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
