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
    key: "digestive",
    label: "Digestive",
    diseases: ["GERD", "Hepatitis A", "Constipation", "Gastroenteritis"],
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
    diseases: ["Conjunctivitis", "Trachoma"],
  },
  {
    key: "ears",
    label: "Ear Problems",
    diseases: ["Otitis Media"],
  },
  {
    key: "pain",
    label: "Pain & Headache",
    diseases: ["Migraine", "Dengue", "Malaria"],
  },
  {
    key: "urinary_rectal",
    label: "Urinary & Rectal",
    diseases: ["Urinary Tract Infection", "Dimorphic Hemorrhoids (Piles)"],
  },
  {
    key: "bone_joint",
    label: "Bone & Joint",
    diseases: ["Osteoarthritis"],
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
