import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/colors";

type Props = {
  taken: number;
  total: number;
  percentage: number;
};

export default function ProgressMetrics({ taken, total, percentage }: Props) {
  return (
    <View style={styles.metricsBox}>
      <View style={styles.metricsHeader}>
        <Text style={styles.metricsTitle}>Progress Metrics</Text>
        <View style={styles.metricsPill}>
          <Text style={styles.metricsPillText}>
            {`${taken}/${total} Taken`}
          </Text>
        </View>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricsTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  metricsPill: {
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  progressBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.greyTrack,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryDark,
    borderRadius: 3,
  },
});
