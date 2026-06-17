import { DiseaseScore } from "./types";
const CONFIDENCE_THRESHOLD = 0.6;

export function scoreAllDiseases(
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  answers: Record<string, number>,
): DiseaseScore[] {
  const rawScores: { disease: string; score: number }[] = [];

  for (const [disease, symptoms] of Object.entries(allDiseaseSymptoms)) {
    let logScore = 0;

    for (const [symptom, probability] of Object.entries(symptoms)) {
      const answer = answers[symptom];
      const p = Math.max(0.01, Math.min(0.99, probability));

      if (answer === 1) {
        logScore += Math.log(p);
      } else if (answer === -1) {
        logScore += Math.log(1 - p);
      }
    }

    rawScores.push({ disease, score: logScore });
  }

  const scores = rawScores.map((d) => d.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  return rawScores
    .map(({ disease, score }) => ({
      disease,
      score,
      confidence: (score - min) / range,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function shouldStop(
  rankings: DiseaseScore[],
  threshold: number = CONFIDENCE_THRESHOLD,
): boolean {
  if (rankings.length === 0) return false;

  const top = rankings[0];
  const second = rankings[1];

  const meetsThreshold = top.confidence >= threshold;
  const hasGap = !second || top.confidence - second.confidence >= 0.1;

  return meetsThreshold && hasGap;
}
