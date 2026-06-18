import { DiseaseScore } from "./types";

const MEANINGFUL_PROBABILITY = 0.1;
const SEED_QUESTION_COUNT = 8;
const TARGET_TOP_N = 4;

export function getClusterPrioritySymptoms(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  clusterDiseases: string[],
  limit: number = SEED_QUESTION_COUNT,
): string[] {
  if (clusterDiseases.length === 0) return [];

  const symptomDiseaseCount: Record<string, number> = {};
  const symptomTotalProb: Record<string, number> = {};
  const totalDiseases = clusterDiseases.length;

  for (const disease of clusterDiseases) {
    const symptoms = allDiseaseSymptoms[disease];
    if (!symptoms) continue;

    for (const [symptom, probability] of Object.entries(symptoms)) {
      if (probability <= MEANINGFUL_PROBABILITY) continue;
      symptomDiseaseCount[symptom] = (symptomDiseaseCount[symptom] ?? 0) + 1;
      symptomTotalProb[symptom] =
        (symptomTotalProb[symptom] ?? 0) + probability;
    }
  }

  return Object.entries(symptomDiseaseCount)
    .map(([symptom, count]) => ({
      symptom,
      count,
      avgProb: symptomTotalProb[symptom] / count,
      prevalence: count / totalDiseases,
    }))
    .filter(
      ({ prevalence }) =>
        // Exclude near-universal symptoms (not discriminating)
        // Exclude very rare symptoms (save for targeted phase)
        prevalence > 0.15 && prevalence < 0.85,
    )
    .sort((a, b) =>
      b.count !== a.count ? b.count - a.count : b.avgProb - a.avgProb,
    )
    .slice(0, limit)
    .map((s) => s.symptom);
}

function getTargetedQuestion(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  rankings: DiseaseScore[],
  askedSymptoms: Set<string>,
): string | null {
  const topDiseases = rankings.slice(0, TARGET_TOP_N);
  const symptomGains: Record<string, number> = {};

  for (const candidate of topDiseases) {
    const symptoms = allDiseaseSymptoms[candidate.disease];
    if (!symptoms) continue;

    for (const [symptom, probability] of Object.entries(symptoms)) {
      if (askedSymptoms.has(symptom)) continue;
      if (probability <= MEANINGFUL_PROBABILITY) continue;

      if (!symptomGains[symptom]) symptomGains[symptom] = 0;

      const definitiveBonus = probability >= 0.97 ? 10 : 0;
      const informativeness = 1 - Math.abs(probability - 0.5) * 2;
      symptomGains[symptom] +=
        informativeness * candidate.confidence + definitiveBonus;
    }
  }

  if (Object.keys(symptomGains).length === 0) return null;

  return Object.entries(symptomGains).sort(([, a], [, b]) => b - a)[0][0];
}

export function pickNextQuestion(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  rankings: DiseaseScore[],
  askedSymptoms: string[],
  prioritySymptoms: string[],
): string | null {
  const asked = new Set(askedSymptoms);

  // Phase 1: seed questions
  const nextSeed = prioritySymptoms.find((s) => !asked.has(s));
  if (nextSeed) return nextSeed;

  // Phase 2: targeted questions
  return getTargetedQuestion(allDiseaseSymptoms, rankings, asked);
}
