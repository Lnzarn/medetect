import { DiseaseScore, HillClimbState } from "./types";

const CONFIDENCE_THRESHOLD = 0.75;
const NEIGHBOR_SYMPTOM_OVERLAP = 3;

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
        const penalty = Math.log(1 - p);
        const weight = 1 + p;
        logScore += penalty * weight;
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

export function getNeighbors(
  target: string,
  allDiseaseSymptoms: Record<string, Record<string, number>>,
): string[] {
  const targetSymptoms = new Set(Object.keys(allDiseaseSymptoms[target] ?? {}));
  const neighbors: string[] = [];

  for (const [disease, symptoms] of Object.entries(allDiseaseSymptoms)) {
    if (disease === target) continue;
    const sharedCount = Object.keys(symptoms).filter((s) =>
      targetSymptoms.has(s),
    ).length;
    if (sharedCount >= NEIGHBOR_SYMPTOM_OVERLAP) {
      neighbors.push(disease);
    }
  }

  return neighbors;
}

export function hillClimb(
  rankings: DiseaseScore[],
  allDiseaseSymptoms: Record<string, Record<string, number>>,
  hillState: HillClimbState,
): { hillState: HillClimbState; peak: DiseaseScore } {
  const scoreMap = new Map(rankings.map((d) => [d.disease, d]));
  const currentPeakScore = scoreMap.get(hillState.currentPeak);

  const effectivePeak = currentPeakScore ?? rankings[0];
  if (!currentPeakScore) {
    return {
      hillState: {
        currentPeak: effectivePeak.disease,
        visitedPeaks: new Set([effectivePeak.disease]),
        iterationsAtPeak: 1,
      },
      peak: effectivePeak,
    };
  }

  const neighbors = getNeighbors(hillState.currentPeak, allDiseaseSymptoms);

  let bestNeighbor: DiseaseScore | null = null;
  for (const neighborDisease of neighbors) {
    if (hillState.visitedPeaks.has(neighborDisease)) continue;
    const neighborScore = scoreMap.get(neighborDisease);
    if (!neighborScore) continue;
    if (!bestNeighbor || neighborScore.confidence > bestNeighbor.confidence) {
      bestNeighbor = neighborScore;
    }
  }

  if (bestNeighbor && bestNeighbor.confidence > effectivePeak.confidence) {
    const newVisited = new Set(hillState.visitedPeaks);
    newVisited.add(bestNeighbor.disease);
    return {
      hillState: {
        currentPeak: bestNeighbor.disease,
        visitedPeaks: newVisited,
        iterationsAtPeak: 1,
      },
      peak: bestNeighbor,
    };
  }

  return {
    hillState: {
      ...hillState,
      iterationsAtPeak: hillState.iterationsAtPeak + 1,
    },
    peak: effectivePeak,
  };
}

export function shouldStop(
  rankings: DiseaseScore[],
  threshold: number = CONFIDENCE_THRESHOLD,
): boolean {
  if (rankings.length === 0) return false;

  const top = rankings[0];
  const second = rankings[1];

  const meetsThreshold = top.confidence >= threshold;
  const hasGap = !second || top.confidence - second.confidence >= 0.2;

  return meetsThreshold && hasGap;
}
