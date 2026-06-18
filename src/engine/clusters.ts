export type ClusterKey =
  | "fever_flu"
  | "respiratory"
  | "skin"
  | "eyes"
  | "ears"
  | "digestive"
  | "pain"
  | "bone_joint"
  | "cardiovascular"
  | "urinary_rectal"
  | "general";

export interface Cluster {
  key: ClusterKey;
  label: string;
  diseases: string[];
  emoji?: string;
}

export const CLUSTERS: Cluster[] = [
  {
    key: "fever_flu",
    label: "Fever & Flu",
    emoji: "🤒",
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
    emoji: "😷",
    diseases: [
      "Bronchial Asthma",
      "Common Cold",
      "Influenza",
      "Sinusitis",
      "Allergy",
    ],
  },
  {
    key: "digestive",
    label: "Digestive",
    emoji: "🤢",
    diseases: ["GERD", "Hepatitis A", "Constipation", "Gastroenteritis"],
  },
  {
    key: "skin",
    label: "Skin",
    emoji: "🧴",
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
    emoji: "👁️",
    diseases: ["Conjunctivitis", "Trachoma"],
  },
  {
    key: "ears",
    label: "Ear Problems",
    emoji: "👂",
    diseases: ["Otitis Media"],
  },
  {
    key: "pain",
    label: "Pain & Headache",
    emoji: "🤕",
    diseases: ["Migraine", "Dengue", "Malaria"],
  },
  {
    key: "urinary_rectal",
    label: "Urinary & Rectal",
    emoji: "🚽",
    diseases: ["Urinary Tract Infection", "Dimorphic Hemorrhoids (Piles)"],
  },
  {
    key: "bone_joint",
    label: "Bone & Joint",
    emoji: "🦴",
    diseases: ["Osteoarthritis"],
  },
  {
    key: "general",
    label: "General / Not Sure",
    emoji: "❓",
    diseases: [],
  },
];

export function getCluster(key: ClusterKey): Cluster | undefined {
  return CLUSTERS.find((c) => c.key === key);
}
