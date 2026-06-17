import { DiseaseScore } from "./types";

export function pickNextQuestion(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  rankings: DiseaseScore[],
  askedSymptoms: string[],
  prioritySymptoms: string[],
  topN: number = 5,
): string | null {
  const asked = new Set(askedSymptoms);
  const topCandidates = rankings.slice(0, topN);

  const nextPriority = prioritySymptoms.find((s) => !asked.has(s));
  if (nextPriority) return nextPriority;

  const symptomGains: Record<string, number> = {};

  for (const candidate of topCandidates) {
    const symptoms = allDiseaseSymptoms[candidate.disease];
    if (!symptoms) continue;

    for (const [symptom, probability] of Object.entries(symptoms)) {
      if (asked.has(symptom)) continue;
      if (probability <= 0.01) continue;

      if (!symptomGains[symptom]) symptomGains[symptom] = 0;

      const gain = 1 - Math.abs(probability - 0.5) * 2;
      symptomGains[symptom] += gain * candidate.confidence;
    }
  }

  if (Object.keys(symptomGains).length === 0) return null;

  return Object.entries(symptomGains).sort(([, a], [, b]) => b - a)[0][0];
}

export function getClusterPrioritySymptoms(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  clusterDiseases: string[],
  limit: number = 8,
): string[] {
  if (clusterDiseases.length === 0) return [];

  const symptomTotals: Record<string, number> = {};
  const symptomCounts: Record<string, number> = {};

  for (const disease of clusterDiseases) {
    const symptoms = allDiseaseSymptoms[disease];
    if (!symptoms) continue;

    for (const [symptom, probability] of Object.entries(symptoms)) {
      if (probability <= 0.01) continue;
      symptomTotals[symptom] = (symptomTotals[symptom] ?? 0) + probability;
      symptomCounts[symptom] = (symptomCounts[symptom] ?? 0) + 1;
    }
  }

  return Object.entries(symptomTotals)
    .map(([symptom, total]) => ({
      symptom,
      avg: total / (symptomCounts[symptom] ?? 1),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit)
    .map((s) => s.symptom);
}
