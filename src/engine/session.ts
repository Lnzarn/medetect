import { getAllDiseaseSymptoms, getPreference } from "@/lib/sync";
import { ClusterKey, getCluster } from "./clusters";
import { getClusterPrioritySymptoms, pickNextQuestion } from "./questionPicker";
import { hillClimb, scoreAllDiseases, shouldStop } from "./scorer";
import {
  Answer,
  AssessmentResult,
  HillClimbState,
  SessionState,
} from "./types";

const CONFIDENCE_SETTINGS: Record<
  "strict" | "normal" | "possibles",
  {
    threshold: number;
    maxQuestions: number;
    minQuestions: number;
    seedCount: number;
  }
> = {
  strict: {
    threshold: 0.85,
    maxQuestions: 20,
    minQuestions: 10,
    seedCount: 12,
  },
  normal: { threshold: 0.75, maxQuestions: 15, minQuestions: 8, seedCount: 8 },
  possibles: {
    threshold: 0.6,
    maxQuestions: 12,
    minQuestions: 6,
    seedCount: 6,
  },
};

const EMERGENCY_SYMPTOMS = [
  "Chest_Pain",
  "Loss_of_Consciousness",
  "Severe_Bleeding",
  "Difficulty_Breathing",
  "Seizure",
];

let _cachedDiseaseSymptoms: Record<string, Record<string, number>> | null =
  null;

async function getDiseaseSymptoms() {
  if (!_cachedDiseaseSymptoms) {
    _cachedDiseaseSymptoms = await getAllDiseaseSymptoms();
  }
  return _cachedDiseaseSymptoms;
}

async function getConfidenceMode(): Promise<"strict" | "normal" | "possibles"> {
  const pref = await getPreference("confidence");
  if (pref === "strict" || pref === "possibles") return pref;
  return "normal";
}

export async function initSession(
  categoryKey: ClusterKey,
): Promise<{ state: SessionState; firstQuestion: string | null }> {
  const allDiseaseSymptoms = await getDiseaseSymptoms();
  const cluster = getCluster(categoryKey);
  const mode = await getConfidenceMode();
  const settings = CONFIDENCE_SETTINGS[mode];

  const clusterDiseases =
    cluster && cluster.diseases.length > 0
      ? cluster.diseases
      : Object.keys(allDiseaseSymptoms);
  const prioritySymptoms = getClusterPrioritySymptoms(
    allDiseaseSymptoms,
    clusterDiseases,
    settings.seedCount,
  );

  const rankings = scoreAllDiseases(allDiseaseSymptoms, {});

  const initialPeak = rankings[0]?.disease ?? "";
  const hillClimbState: HillClimbState = {
    currentPeak: initialPeak,
    visitedPeaks: new Set([initialPeak]),
    iterationsAtPeak: 0,
  };

  const state: SessionState = {
    category: categoryKey,
    answers: {},
    rankings,
    askedSymptoms: [],
    phase: "seed",
    questionCount: 0,
    result: null,
    hillClimb: hillClimbState,
    confidenceMode: mode,
  };

  const firstQuestion = pickNextQuestion(
    allDiseaseSymptoms,
    rankings,
    [],
    prioritySymptoms,
  );

  return { state, firstQuestion };
}

export async function processAnswer(
  state: SessionState,
  symptom: string,
  answer: Answer,
): Promise<{
  state: SessionState;
  nextQuestion: string | null;
  result: AssessmentResult | null;
}> {
  const allDiseaseSymptoms = await getDiseaseSymptoms();
  const cluster = getCluster(state.category as ClusterKey);
  const mode = state.confidenceMode ?? "normal";
  const settings = CONFIDENCE_SETTINGS[mode];

  const clusterDiseases =
    cluster && cluster.diseases.length > 0
      ? cluster.diseases
      : Object.keys(allDiseaseSymptoms);

  const prioritySymptoms = getClusterPrioritySymptoms(
    allDiseaseSymptoms,
    clusterDiseases,
    settings.seedCount,
  );

  // Step 1: Record answer
  const newAnswers = { ...state.answers, [symptom]: answer };
  const newAsked = [...state.askedSymptoms, symptom];
  const newCount = state.questionCount + 1;

  // Emergency check
  if (answer === 1 && EMERGENCY_SYMPTOMS.includes(symptom)) {
    const rankings = scoreAllDiseases(allDiseaseSymptoms, newAnswers);
    const result: AssessmentResult = {
      topMatches: rankings.slice(0, 3),
      isEmergency: true,
      stoppedReason: "threshold_met",
      totalQuestionsAsked: newCount,
    };
    return {
      state: {
        ...state,
        answers: newAnswers,
        askedSymptoms: newAsked,
        questionCount: newCount,
        phase: "done",
        result,
        hillClimb: state.hillClimb,
      },
      nextQuestion: null,
      result,
    };
  }

  // Step 2: Score
  const rankings = scoreAllDiseases(allDiseaseSymptoms, newAnswers);

  // Step 3: Hill Climbing
  const { hillState: newHillState, peak } = hillClimb(
    rankings,
    allDiseaseSymptoms,
    state.hillClimb,
  );

  const peakEntry = rankings.find((r) => r.disease === peak.disease);
  const reorderedRankings =
    peakEntry && peakEntry.confidence > rankings[0].confidence
      ? [peakEntry, ...rankings.filter((r) => r.disease !== peak.disease)]
      : rankings;

  // Step 4: Phase
  const newPhase = newCount >= prioritySymptoms.length ? "climbing" : "seed";

  // Step 5: Next question
  const nextQuestion = pickNextQuestion(
    allDiseaseSymptoms,
    reorderedRankings,
    newAsked,
    prioritySymptoms,
  );

  // Step 6: Stop conditions (uses per-mode threshold & limits)
  const hitThreshold =
    newCount >= settings.minQuestions &&
    shouldStop(reorderedRankings, settings.threshold);
  const hitMaxQuestions = newCount >= settings.maxQuestions;
  const noMoreQuestions = nextQuestion === null;

  if (hitThreshold || hitMaxQuestions || noMoreQuestions) {
    const result: AssessmentResult = {
      topMatches: reorderedRankings.slice(0, 3),
      isEmergency: false,
      stoppedReason: hitThreshold
        ? "threshold_met"
        : hitMaxQuestions
          ? "max_questions"
          : "no_more_questions",
      totalQuestionsAsked: newCount,
    };
    return {
      state: {
        ...state,
        answers: newAnswers,
        askedSymptoms: newAsked,
        rankings: reorderedRankings,
        questionCount: newCount,
        phase: "done",
        result,
        hillClimb: newHillState,
      },
      nextQuestion: null,
      result,
    };
  }

  // Step 7: Continue
  return {
    state: {
      ...state,
      answers: newAnswers,
      askedSymptoms: newAsked,
      rankings: reorderedRankings,
      questionCount: newCount,
      phase: newPhase,
      hillClimb: newHillState,
      confidenceMode: mode,
    },
    nextQuestion,
    result: null,
  };
}
