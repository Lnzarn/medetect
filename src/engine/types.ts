export type Answer = 1 | 0 | -1;

export interface DiseaseScore {
  disease: string;
  score: number;
  confidence: number;
}

export interface SessionState {
  category: string;
  answers: Record<string, Answer>;
  rankings: DiseaseScore[];
  askedSymptoms: string[];
  phase: "seed" | "climbing" | "done";
  questionCount: number;
  result: AssessmentResult | null;
}

export interface AssessmentResult {
  topMatches: DiseaseScore[];
  isEmergency: boolean;
  stoppedReason: "threshold_met" | "max_questions" | "no_more_questions";
  totalQuestionsAsked: number;
}
