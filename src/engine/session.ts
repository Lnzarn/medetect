import { getAllDiseaseSymptoms } from "@/lib/sync";
import { ClusterKey, getCluster } from "./clusters";
import { getClusterPrioritySymptoms, pickNextQuestion } from "./questionPicker";
import { scoreAllDiseases, shouldStop } from "./scorer";
import { Answer, AssessmentResult, SessionState } from "./types";

const MAX_QUESTIONS = 20;
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

export async function initSession(
  categoryKey: ClusterKey,
): Promise<{ state: SessionState; firstQuestion: string | null }> {
  const allDiseaseSymptoms = await getDiseaseSymptoms();
  const cluster = getCluster(categoryKey);

  const clusterDiseases =
    cluster && cluster.diseases.length > 0
      ? cluster.diseases
      : Object.keys(allDiseaseSymptoms);

  const prioritySymptoms = getClusterPrioritySymptoms(
    allDiseaseSymptoms,
    clusterDiseases,
  );

  const rankings = scoreAllDiseases(allDiseaseSymptoms, {});

  const state: SessionState = {
    category: categoryKey,
    answers: {},
    rankings,
    askedSymptoms: [],
    phase: "seed",
    questionCount: 0,
    result: null,
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

  const clusterDiseases =
    cluster && cluster.diseases.length > 0
      ? cluster.diseases
      : Object.keys(allDiseaseSymptoms);

  const prioritySymptoms = getClusterPrioritySymptoms(
    allDiseaseSymptoms,
    clusterDiseases,
  );

  // 1. Record answer
  const newAnswers = { ...state.answers, [symptom]: answer };
  const newAsked = [...state.askedSymptoms, symptom];
  const newCount = state.questionCount + 1;

  // 2. Emergency check
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
      },
      nextQuestion: null,
      result,
    };
  }

  // 3. Re-score all diseases
  const rankings = scoreAllDiseases(allDiseaseSymptoms, newAnswers);

  // 4. Determine phase
  const newPhase = newCount >= prioritySymptoms.length ? "climbing" : "seed";

  // 5. Check stop conditions
  const hitThreshold = shouldStop(rankings);
  const hitMaxQuestions = newCount >= MAX_QUESTIONS;
  const nextQuestion = pickNextQuestion(
    allDiseaseSymptoms,
    rankings,
    newAsked,
    prioritySymptoms,
  );
  const noMoreQuestions = nextQuestion === null;

  if (hitThreshold || hitMaxQuestions || noMoreQuestions) {
    const result: AssessmentResult = {
      topMatches: rankings.slice(0, 5),
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
        rankings,
        questionCount: newCount,
        phase: "done",
        result,
      },
      nextQuestion: null,
      result,
    };
  }

  // 6. Continue - return next question
  return {
    state: {
      ...state,
      answers: newAnswers,
      askedSymptoms: newAsked,
      rankings,
      questionCount: newCount,
      phase: newPhase,
    },
    nextQuestion,
    result: null,
  };
}
