import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

interface StepBarProps {
  step?: number;
  total?: number;
}

export default function StepBar({ step = 1, total = 3 }: StepBarProps) {
  const pct = (step / total) * 100;
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepLabel}>
        Step {step} of {total}
      </Text>
      <View style={styles.stepTrack}>
        <View style={[styles.stepFill, { width: `${pct}%` }]} />
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
    color: Colors.grey,
    marginBottom: 6,
  },
  stepTrack: {
    height: 5,
    backgroundColor: Colors.greyTrack,
    borderRadius: 10,
    overflow: "hidden",
  },
  stepFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
});
