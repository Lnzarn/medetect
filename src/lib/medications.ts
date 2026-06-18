import { getDB } from "./client";
import { supabase } from "./supabase";

export interface MedicationRow {
  id: number;
  remote_id: string | null;
  user_id: string;
  name: string;
  info: string;
  time: string; // "HH:MM"
  start_date: string; // ISO yyyy-mm-dd
  end_date: string | null; // ISO yyyy-mm-dd, null = no end date (ongoing)
  created_at: string;
  synced: boolean;
}

export interface ScheduleItem {
  id: number;
  name: string;
  info: string;
  time: string;
  startDate: string;
  endDate: string | null;
  taken: boolean;
}

export type DayStatus = "complete" | "incomplete" | "scheduled" | "none";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export async function addMedication(params: {
  userId: string;
  name: string;
  info: string;
  time: string;
  startDate: string;
  endDate: string | null;
}): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO medications
      (user_id, name, info, time, start_date, end_date, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    params.userId,
    params.name,
    params.info,
    params.time,
    params.startDate,
    params.endDate,
    new Date().toISOString(),
  );
  return result.lastInsertRowId as number;
}

export async function deleteMedicationById(id: number): Promise<void> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ remote_id: string | null }>(
    `SELECT remote_id FROM medications WHERE id = ?`,
    id,
  );

  await db.runAsync(`DELETE FROM medications WHERE id = ?`, id);

  if (row?.remote_id) {
    await supabase
      .from("medications")
      .delete()
      .eq("id", row.remote_id)
      .then(({ error }) => {
        if (error)
          console.warn("Remote medication delete failed:", error.message);
      });
  }
}

export async function getScheduleForDate(
  userId: string,
  dateISO: string,
): Promise<ScheduleItem[]> {
  const db = await getDB();

  const meds = await db.getAllAsync<{
    id: number;
    name: string;
    info: string;
    time: string;
    start_date: string;
    end_date: string | null;
  }>(
    `SELECT id, name, info, time, start_date, end_date
     FROM medications
     WHERE user_id = ?
       AND start_date <= ?
       AND (end_date IS NULL OR end_date >= ?)
     ORDER BY time ASC`,
    userId,
    dateISO,
    dateISO,
  );

  if (meds.length === 0) return [];

  const logs = await db.getAllAsync<{ medication_id: number; taken: number }>(
    `SELECT medication_id, taken FROM medication_logs
     WHERE user_id = ? AND log_date = ?`,
    userId,
    dateISO,
  );
  const takenSet = new Set(
    logs.filter((l) => l.taken === 1).map((l) => l.medication_id),
  );

  return meds.map((m) => ({
    id: m.id,
    name: m.name,
    info: m.info,
    time: m.time,
    startDate: m.start_date,
    endDate: m.end_date,
    taken: takenSet.has(m.id),
  }));
}

// Mark (or unmark) a medication as taken for a given date
export async function setMedicationTaken(
  userId: string,
  medicationId: number,
  dateISO: string,
  taken: boolean,
): Promise<void> {
  const db = await getDB();
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM medication_logs WHERE medication_id = ? AND log_date = ?`,
    medicationId,
    dateISO,
  );

  if (existing) {
    await db.runAsync(
      `UPDATE medication_logs SET taken = ?, taken_at = ?, synced = 0 WHERE id = ?`,
      taken ? 1 : 0,
      taken ? new Date().toISOString() : null,
      existing.id,
    );
  } else {
    await db.runAsync(
      `INSERT INTO medication_logs
        (medication_id, user_id, log_date, taken, taken_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)`,
      medicationId,
      userId,
      dateISO,
      taken ? 1 : 0,
      taken ? new Date().toISOString() : null,
    );
  }
}

// Per-day status across a whole month, used to draw dots on the calendar
export async function getMonthStatusMap(
  userId: string,
  year: number,
  month: number, // 0-indexed
): Promise<Record<string, DayStatus>> {
  const db = await getDB();

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const meds = await db.getAllAsync<{
    id: number;
    start_date: string;
    end_date: string | null;
  }>(
    `SELECT id, start_date, end_date FROM medications
     WHERE user_id = ? AND start_date <= ? AND (end_date IS NULL OR end_date >= ?)`,
    userId,
    monthEnd,
    monthStart,
  );

  const map: Record<string, DayStatus> = {};
  if (meds.length === 0) return map;

  const logs = await db.getAllAsync<{
    medication_id: number;
    log_date: string;
  }>(
    `SELECT medication_id, log_date FROM medication_logs
     WHERE user_id = ? AND log_date BETWEEN ? AND ? AND taken = 1`,
    userId,
    monthStart,
    monthEnd,
  );

  const takenByDate: Record<string, Set<number>> = {};
  for (const log of logs) {
    if (!takenByDate[log.log_date]) takenByDate[log.log_date] = new Set();
    takenByDate[log.log_date].add(log.medication_id);
  }

  const today = todayISO();

  for (let day = 1; day <= lastDay; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const activeIds = meds
      .filter((m) => m.start_date <= iso && (!m.end_date || m.end_date >= iso))
      .map((m) => m.id);

    if (activeIds.length === 0) {
      map[iso] = "none";
      continue;
    }

    if (iso > today) {
      map[iso] = "scheduled";
      continue;
    }

    const takenSet = takenByDate[iso] ?? new Set<number>();
    const takenCount = activeIds.filter((id) => takenSet.has(id)).length;
    map[iso] = takenCount === activeIds.length ? "complete" : "incomplete";
  }

  return map;
}

export async function syncMedications(userId: string): Promise<{
  pushed: number;
  pulled: number;
}> {
  let pushed = 0;
  let pulled = 0;

  try {
    const db = await getDB();

    const unsyncedMeds = await db.getAllAsync<{
      id: number;
      name: string;
      info: string;
      time: string;
      start_date: string;
      end_date: string | null;
      created_at: string;
    }>(
      `SELECT id, name, info, time, start_date, end_date, created_at
       FROM medications WHERE user_id = ? AND synced = 0`,
      userId,
    );

    for (const row of unsyncedMeds) {
      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: userId,
          name: row.name,
          info: row.info,
          time: row.time,
          start_date: row.start_date,
          end_date: row.end_date,
          created_at: row.created_at,
        })
        .select("id")
        .single();

      if (error) {
        console.warn(
          `Medication push failed for local row ${row.id}:`,
          error.message,
        );
        continue;
      }

      await db.runAsync(
        `UPDATE medications SET synced = 1, remote_id = ? WHERE id = ?`,
        data.id,
        row.id,
      );
      pushed++;
    }

    // --- Pull remote medications not present locally ---
    const { data: remoteMeds, error: medsPullError } = await supabase
      .from("medications")
      .select("id, name, info, time, start_date, end_date, created_at")
      .eq("user_id", userId);

    if (medsPullError) {
      console.warn("Medications pull failed:", medsPullError.message);
    } else {
      for (const remote of remoteMeds ?? []) {
        const existing = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM medications WHERE remote_id = ?`,
          remote.id,
        );
        if (existing) continue;

        await db.runAsync(
          `INSERT INTO medications
            (remote_id, user_id, name, info, time, start_date, end_date, created_at, synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          remote.id,
          userId,
          remote.name,
          remote.info,
          remote.time,
          remote.start_date,
          remote.end_date,
          remote.created_at,
        );
        pulled++;
      }
    }

    const unsyncedLogs = await db.getAllAsync<{
      id: number;
      medication_id: number;
      log_date: string;
      taken: number;
      taken_at: string | null;
    }>(
      `SELECT l.id, l.medication_id, l.log_date, l.taken, l.taken_at
       FROM medication_logs l
       JOIN medications m ON m.id = l.medication_id
       WHERE l.user_id = ? AND l.synced = 0 AND m.remote_id IS NOT NULL`,
      userId,
    );

    for (const row of unsyncedLogs) {
      const med = await db.getFirstAsync<{ remote_id: string }>(
        `SELECT remote_id FROM medications WHERE id = ?`,
        row.medication_id,
      );
      if (!med?.remote_id) continue;

      const { data, error } = await supabase
        .from("medication_logs")
        .upsert(
          {
            medication_id: med.remote_id,
            user_id: userId,
            log_date: row.log_date,
            taken: row.taken === 1,
            taken_at: row.taken_at,
          },
          { onConflict: "medication_id,log_date" },
        )
        .select("id")
        .single();

      if (error) {
        console.warn(
          `Medication log push failed for local row ${row.id}:`,
          error.message,
        );
        continue;
      }

      await db.runAsync(
        `UPDATE medication_logs SET synced = 1, remote_id = ? WHERE id = ?`,
        data.id,
        row.id,
      );
      pushed++;
    }

    const { data: remoteLogs, error: logsPullError } = await supabase
      .from("medication_logs")
      .select("id, medication_id, log_date, taken, taken_at")
      .eq("user_id", userId);

    if (logsPullError) {
      console.warn("Medication logs pull failed:", logsPullError.message);
    } else {
      for (const remote of remoteLogs ?? []) {
        const existing = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM medication_logs WHERE remote_id = ?`,
          remote.id,
        );
        if (existing) continue;

        const localMed = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM medications WHERE remote_id = ?`,
          remote.medication_id,
        );
        if (!localMed) continue; // medication itself hasn't been pulled yet, retry next sync

        await db.runAsync(
          `INSERT INTO medication_logs
            (remote_id, medication_id, user_id, log_date, taken, taken_at, synced)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          remote.id,
          localMed.id,
          userId,
          remote.log_date,
          remote.taken ? 1 : 0,
          remote.taken_at,
        );
        pulled++;
      }
    }
  } catch (e) {
    console.error("syncMedications error:", e);
  }

  console.log(`Medication sync: pushed ${pushed}, pulled ${pulled}`);
  return { pushed, pulled };
}
