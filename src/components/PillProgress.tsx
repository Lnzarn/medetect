import { useAppColors } from '@/lib/theme';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  taken: number;
  total: number;
  percentage: number;
};

export default function ProgressMetrics({ taken, total, percentage }: Props) {
  const colors = useAppColors();
  return (
    <View style={[styles.metricsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.metricsHeader}>
        <Text style={styles.metricsTitle}>Progress Metrics</Text>
        <View style={[styles.metricsPill, { backgroundColor: colors.elementBg }]}>
          <Text style={[styles.metricsPillText, { color: colors.primaryDark }]}>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricsTitle: { fontSize: 15, fontWeight: "700" },
  metricsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
