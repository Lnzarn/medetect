import { useAppColors } from '@/lib/theme';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StepBarProps {
  step?: number;
  total?: number;
}

export default function StepBar({ step = 1, total = 3 }: StepBarProps) {
  const colors = useAppColors();
  const pct = (step / total) * 100;
  return (
    <View style={styles.stepWrap}>
      <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
        Step {step} of {total}
      </Text>
      <View style={[styles.stepTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.stepFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepWrap: {
    marginBottom: 22,
  },
  stepLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  stepTrack: {
    height: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  stepFill: {
    height: "100%",
    borderRadius: 10,
  },
});
