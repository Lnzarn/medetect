export type Answer = 1 | 0 | -1;

export interface DiseaseScore {
    disease: string;
    score: number;
    confidence: number;
}