import BottomNav from "@/components/BottomNav";
import { CLUSTERS } from "@/engine/clusters";
import { getSymptomsForDisease } from "@/lib/sync";
import { useAppColors } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import arrowIcon from "../icons/arrow.png";

interface SymptomRow {
  symptom: string;
  probability: number;
}

// Static disease descriptions — extend as needed
const DISEASE_DESCRIPTIONS: Record<string, string> = {
  Dengue:
    "A mosquito-borne viral infection causing high fever, severe headache, pain behind the eyes, joint and muscle pain, rash, and mild bleeding. Common in tropical regions.",
  Influenza:
    "A contagious respiratory illness caused by influenza viruses. Symptoms include fever, cough, sore throat, body aches, headache, chills, and fatigue.",
  Malaria:
    "A life-threatening disease caused by Plasmodium parasites transmitted through infected mosquito bites. Characterized by cyclical fever, chills, and flu-like symptoms.",
  "Common Cold":
    "A mild viral infection of the upper respiratory tract causing runny nose, sneezing, sore throat, cough, and mild fever. Usually resolves within 7–10 days.",
  Chickenpox:
    "A highly contagious viral infection causing an itchy, blister-like rash along with fever and tiredness. Caused by the varicella-zoster virus.",
  Measles:
    "A highly contagious viral disease characterized by high fever, cough, runny nose, red eyes, and a distinctive red rash spreading from the face downward.",
  "Bronchial Asthma":
    "A chronic inflammatory disease of the airways causing recurring episodes of wheezing, breathlessness, chest tightness, and coughing.",
  Sinusitis:
    "Inflammation of the sinuses, often following a cold or allergy. Symptoms include facial pain, nasal congestion, headache, and thick nasal discharge.",
  Allergy:
    "An immune system reaction to a normally harmless substance. Common symptoms include sneezing, itchy eyes, runny nose, skin rashes, and sometimes difficulty breathing.",
  GERD: "Gastroesophageal reflux disease occurs when stomach acid frequently flows back into the esophagus, causing heartburn, regurgitation, and chest discomfort.",
  "Hepatitis A":
    "A viral liver infection spread through contaminated food or water. Symptoms include fatigue, nausea, stomach pain, dark urine, and jaundice.",
  Constipation:
    "A condition where bowel movements are infrequent or difficult to pass, often accompanied by bloating and abdominal discomfort.",
  Gastroenteritis:
    "Inflammation of the stomach and intestines, typically caused by viral or bacterial infection. Symptoms include nausea, vomiting, diarrhea, and stomach cramps.",
  Acne: "A skin condition that occurs when hair follicles become clogged with oil and dead skin cells, leading to pimples, blackheads, and inflammation.",
  "Drug Reaction":
    "An adverse reaction to a medication, which can range from mild skin rashes to severe life-threatening responses. Symptoms vary widely depending on the drug and individual.",
  "Fungal Infection":
    "An infection caused by fungi affecting the skin, nails, or other body parts. Common types include ringworm, athlete's foot, and candidiasis.",
  Impetigo:
    "A highly contagious bacterial skin infection causing red sores that rupture, ooze, and form honey-colored crusts. Common in children.",
  Psoriasis:
    "A chronic autoimmune skin condition that causes rapid buildup of skin cells, resulting in scaling, itching, and red patches.",
  Conjunctivitis:
    "Inflammation or infection of the conjunctiva (the transparent membrane lining the eyelid). Causes redness, discharge, and itchiness in one or both eyes.",
  Trachoma:
    "A bacterial eye infection caused by Chlamydia trachomatis. Repeated infections can lead to scarring of the eyelid and cornea, potentially causing blindness.",
  Migraine:
    "A neurological condition causing intense, throbbing headaches often on one side of the head, accompanied by nausea, vomiting, and sensitivity to light and sound.",
  "Urinary Tract Infection":
    "An infection in any part of the urinary system. Common symptoms include burning sensation when urinating, frequent urination, cloudy urine, and pelvic pain.",
  "Dimorphic Hemorrhoids (Piles)":
    "Swollen veins in the lowest part of the rectum and anus. Symptoms include bleeding during bowel movements, itching, pain, and swelling around the anus.",
  Osteoarthritis:
    "A degenerative joint disease causing cartilage breakdown, leading to pain, stiffness, swelling, and decreased range of motion, typically in knees, hips, and hands.",
  "Otitis Media":
    "A middle ear infection commonly affecting children. Symptoms include ear pain, hearing difficulty, fever, and sometimes drainage from the ear.",
};

function getClusterForDisease(disease: string) {
  for (const cluster of CLUSTERS) {
    if (cluster.key === "general") continue;
    if (cluster.diseases.includes(disease)) {
      return cluster;
    }
  }
  return CLUSTERS.find((c) => c.key === "general")!;
}

function getProbabilityBar(prob: number) {
  // prob > 0.01 means associated; show strength
  const pct = Math.round(prob * 100);
  let color = "#10B981";
  if (prob >= 0.6) color = "#EF4444";
  else if (prob >= 0.35) color = "#F59E0B";
  return { pct, color };
}

export default function DiseaseDetail() {
  const router = useRouter();
  const colors = useAppColors();
  const params = useLocalSearchParams<{ disease: string }>();
  const disease = params.disease ?? "";

  const [symptoms, setSymptoms] = useState<SymptomRow[]>([]);
  const [loading, setLoading] = useState(true);

  const cluster = getClusterForDisease(disease);
  const description =
    DISEASE_DESCRIPTIONS[disease] ??
    "No description available for this disease.";

  useEffect(() => {
    let mounted = true;
    getSymptomsForDisease(disease)
      .then((rows) => {
        if (!mounted) return;
        // Only show symptoms that are actually associated (prob > 0.01)
        setSymptoms(rows.filter((r) => r.probability > 0.01));
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [disease]);

  const isDark = colors.text === "#FFFFFF";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Image source={arrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{disease}</Text>
          <View style={styles.clusterBadge}>
            <Text style={styles.clusterBadgeText}>
              {cluster.emoji} {cluster.label}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            About
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {description}
          </Text>
        </View>

        {/* Category */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Category
          </Text>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryEmoji}>{cluster.emoji}</Text>
            <View>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {cluster.label}
              </Text>
              <Text style={[styles.categoryKey, { color: colors.textMuted }]}>
                Cluster: {cluster.key.replace(/_/g, " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Symptoms */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Associated Symptoms
          </Text>
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: 12 }}
            />
          ) : symptoms.length === 0 ? (
            <Text style={[styles.noSymptoms, { color: colors.textMuted }]}>
              No specific symptom data available.
            </Text>
          ) : (
            symptoms.map((row) => {
              const { pct, color } = getProbabilityBar(row.probability);
              return (
                <View key={row.symptom} style={styles.symptomRow}>
                  <View style={styles.symptomLabelRow}>
                    <Text style={[styles.symptomName, { color: colors.text }]}>
                      {row.symptom.replace(/_/g, " ")}
                    </Text>
                    <Text style={[styles.symptomPct, { color }]}>{pct}%</Text>
                  </View>
                  <View
                    style={[styles.barBg, { backgroundColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        { width: `${pct}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          ⚠️ This directory is for informational purposes only. Always consult a
          licensed healthcare provider for diagnosis and treatment.
        </Text>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: "#FFFFFF",
    transform: [{ rotate: "180deg" }],
    resizeMode: "contain",
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  clusterBadge: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  clusterBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
  },
  categoryKey: {
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  noSymptoms: {
    fontSize: 13,
    fontStyle: "italic",
  },
  symptomRow: {
    marginBottom: 12,
  },
  symptomLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  symptomName: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "capitalize",
    flex: 1,
  },
  symptomPct: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  barBg: {
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 4,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 8,
    marginTop: 4,
  },
});
