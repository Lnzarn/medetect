import { DiseaseScore } from "@/engine/types";
import { getDB } from "./client";
import { supabase } from "./supabase";

export interface AssessmentHistoryRow {
  id: number;
  remote_id: string | null;
  user_id: string;
  assessed_at: string;
  category: string;
  top_matches: DiseaseScore[];
  is_emergency: boolean;
  stopped_reason: "threshold_met" | "max_questions" | "no_more_questions";
  questions_asked: number;
  confidence_level: "strict" | "normal" | "possibles";
  synced: boolean;
}

export async function saveAssessment(params: {
  userId: string;
  category: string;
  topMatches: DiseaseScore[];
  isEmergency: boolean;
  stoppedReason: AssessmentHistoryRow["stopped_reason"];
  questionsAsked: number;
  confidenceLevel: AssessmentHistoryRow["confidence_level"];
}): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO assessment_history
      (user_id, assessed_at, category, top_matches, is_emergency,
       stopped_reason, questions_asked, confidence_level, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    params.userId,
    new Date().toISOString(),
    params.category,
    JSON.stringify(params.topMatches),
    params.isEmergency ? 1 : 0,
    params.stoppedReason,
    params.questionsAsked,
    params.confidenceLevel,
  );
}

export async function getAssessmentHistory(
  userId: string,
): Promise<AssessmentHistoryRow[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{
    id: number;
    remote_id: string | null;
    user_id: string;
    assessed_at: string;
    category: string;
    top_matches: string;
    is_emergency: number;
    stopped_reason: string;
    questions_asked: number;
    confidence_level: string;
    synced: number;
  }>(
    `SELECT * FROM assessment_history
     WHERE user_id = ?
     ORDER BY assessed_at DESC`,
    userId,
  );

  return rows.map((r) => ({
    id: r.id,
    remote_id: r.remote_id,
    user_id: r.user_id,
    assessed_at: r.assessed_at,
    category: r.category,
    top_matches: JSON.parse(r.top_matches) as DiseaseScore[],
    is_emergency: r.is_emergency === 1,
    stopped_reason: r.stopped_reason as AssessmentHistoryRow["stopped_reason"],
    questions_asked: r.questions_asked,
    confidence_level:
      r.confidence_level as AssessmentHistoryRow["confidence_level"],
    synced: r.synced === 1,
  }));
}

export async function deleteAssessment(
  id: number,
  remoteId: string | null,
): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM assessment_history WHERE id = ?`, id);

  if (remoteId) {
    await supabase
      .from("assessment_history")
      .delete()
      .eq("id", remoteId)
      .then(({ error }) => {
        if (error) console.warn("Remote delete failed:", error.message);
      });
  }
}

export async function clearAllAssessments(userId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM assessment_history WHERE user_id = ?`, userId);

  await supabase
    .from("assessment_history")
    .delete()
    .eq("user_id", userId)
    .then(({ error }) => {
      if (error) console.warn("Remote clear failed:", error.message);
    });
}

export async function syncAssessmentHistory(userId: string): Promise<{
  pushed: number;
  pulled: number;
}> {
  let pushed = 0;
  let pulled = 0;

  try {
    const db = await getDB();
    const unsynced = await db.getAllAsync<{
      id: number;
      assessed_at: string;
      category: string;
      top_matches: string;
      is_emergency: number;
      stopped_reason: string;
      questions_asked: number;
      confidence_level: string;
    }>(
      `SELECT id, assessed_at, category, top_matches, is_emergency,
              stopped_reason, questions_asked, confidence_level
       FROM assessment_history
       WHERE user_id = ? AND synced = 0`,
      userId,
    );

    for (const row of unsynced) {
      const { data, error } = await supabase
        .from("assessment_history")
        .insert({
          user_id: userId,
          assessed_at: row.assessed_at,
          category: row.category,
          top_matches: JSON.parse(row.top_matches),
          is_emergency: row.is_emergency === 1,
          stopped_reason: row.stopped_reason,
          questions_asked: row.questions_asked,
          confidence_level: row.confidence_level,
        })
        .select("id")
        .single();

      if (error) {
        console.warn(`Push failed for local row ${row.id}:`, error.message);
        continue;
      }

      await db.runAsync(
        `UPDATE assessment_history
         SET synced = 1, remote_id = ?
         WHERE id = ?`,
        data.id,
        row.id,
      );
      pushed++;
    }

    const { data: remoteRows, error: pullError } = await supabase
      .from("assessment_history")
      .select(
        "id, assessed_at, category, top_matches, is_emergency, stopped_reason, questions_asked, confidence_level",
      )
      .eq("user_id", userId)
      .order("assessed_at", { ascending: false });

    if (pullError) {
      console.warn("Pull failed:", pullError.message);
      return { pushed, pulled };
    }

    for (const remote of remoteRows ?? []) {
      const existing = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM assessment_history WHERE remote_id = ?`,
        remote.id,
      );
      if (existing) continue;

      await db.runAsync(
        `INSERT INTO assessment_history
          (remote_id, user_id, assessed_at, category, top_matches,
           is_emergency, stopped_reason, questions_asked, confidence_level, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        remote.id,
        userId,
        remote.assessed_at,
        remote.category,
        JSON.stringify(remote.top_matches),
        remote.is_emergency ? 1 : 0,
        remote.stopped_reason,
        remote.questions_asked,
        remote.confidence_level,
      );
      pulled++;
    }
  } catch (e) {
    console.error("syncAssessmentHistory error:", e);
  }

  console.log(`Assessment sync: pushed ${pushed}, pulled ${pulled}`);
  return { pushed, pulled };
}
