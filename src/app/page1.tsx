import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import StepBar from "../components/StepBar";
import Colors from "../constants/colors";
import { CLUSTERS, ClusterKey } from "../engine/clusters";

export default function CategoryPickerScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<ClusterKey | null>(null);

  const handleSelect = (key: ClusterKey) => setSelected(key);

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/page2?category=${selected}`);
  };

  const handleBottomNav = (key: string) => {
    if (key === "calendar") router.push("/pill_sched");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topSection}>
        <StepBar step={1} total={3} />
        <Text style={styles.question}>
          WHERE ARE YOU{"\n"}EXPERIENCING{"\n"}SYMPTOMS?
        </Text>
        <Text style={styles.instruction}>
          Select the area that best describes where you are feeling discomfort.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {CLUSTERS.map((cluster) => {
          const isSelected = selected === cluster.key;
          return (
            <TouchableOpacity
              key={cluster.key}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(cluster.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.cardEmoji}>{cluster.emoji}</Text>
              <Text
                style={[
                  styles.cardLabel,
                  isSelected && styles.cardLabelSelected,
                ]}
              >
                {cluster.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 6,
    marginTop: 8,
  },
  instruction: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  scroll: { flex: 1, paddingHorizontal: 22, marginTop: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    width: "47%",
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    gap: 8,
  },
  cardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cardEmoji: { fontSize: 32 },
  cardLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  cardLabelSelected: { color: Colors.white },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.greyLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
