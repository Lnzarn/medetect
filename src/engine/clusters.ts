export type ClusterKey =
  | "fever_flu"
  | "respiratory"
  | "skin"
  | "eyes"
  | "digestive"
  | "pain_mobility"
  | "cardiovascular"
  | "urinary"
  | "general";

export interface Cluster {
  key: ClusterKey;
  label: string;
  diseases: string[];
}

export const CLUSTERS: Cluster[] = [
  {
    key: "fever_flu",
    label: "Fever & Flu",
    diseases: [
      "Dengue",
      "Influenza",
      "Malaria",
      "Common Cold",
      "Chickenpox",
      "Measles",
    ],
  },
  {
    key: "respiratory",
    label: "Respiratory",
    diseases: [
      "Bronchial Asthma",
      "Common Cold",
      "Influenza",
      "Sinusitis",
      "Allergy",
    ],
  },
  {
    key: "skin",
    label: "Skin",
    diseases: [
      "Acne",
      "Chickenpox",
      "Drug Reaction",
      "Fungal Infection",
      "Impetigo",
      "Measles",
      "Psoriasis",
    ],
  },
  {
    key: "eyes",
    label: "Eyes",
    diseases: ["Conjunctivitis", "Trachoma", "Measles"],
  },
  {
    key: "digestive",
    label: "Digestive",
    diseases: ["GERD", "Hepatitis A", "Jaundice", "Constipation"],
  },
  {
    key: "pain_mobility",
    label: "Pain & Mobility",
    diseases: ["Osteoarthritis", "Migraine", "Dengue", "Malaria", "Arthritis"],
  },
  {
    key: "cardiovascular",
    label: "Heart & Blood Pressure",
    diseases: ["Hypertension"],
  },
  {
    key: "urinary",
    label: "Urinary",
    diseases: ["Urinary Tract Infection"],
  },
  {
    key: "general",
    label: "General / Not Sure",
    diseases: [],
  },
];

export function getCluster(key: ClusterKey): Cluster | undefined {
  return CLUSTERS.find((c) => c.key === key);
}
