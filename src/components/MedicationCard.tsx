import { useAppColors } from "@/lib/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type MedicationItem = {
  id: number;
  name: string;
  info: string;
  time: string;
  taken: boolean;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string | null; // ISO yyyy-mm-dd, null = ongoing
};

type Props = {
  item: MedicationItem;
  onTakePill: (id: number) => void;
  onDelete?: (id: number) => void;
};

function formatShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("default", {
    month: "short",
    day: "numeric",
  });
}

export default function MedicationCard({ item, onTakePill, onDelete }: Props) {
  const colors = useAppColors();

  const rangeLabel = item.endDate
    ? `Until ${formatShort(item.endDate)}`
    : `Since ${formatShort(item.startDate)} · Ongoing`;

  return (
    <TouchableOpacity
      activeOpacity={onDelete ? 0.8 : 1}
      onLongPress={onDelete ? () => onDelete(item.id) : undefined}
      style={[
        styles.pillCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        item.taken && {
          backgroundColor: colors.elementBg,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.pillInfoWrapper}>
        <View>
          <Text
            style={[
              styles.pillName,
              item.taken && styles.pillNameTaken,
              { color: item.taken ? colors.textMuted : colors.text },
            ]}
          >
            {item.name}
          </Text>
          {!!item.info && (
            <Text style={[styles.pillInfo, { color: colors.textMuted }]}>
              {item.info}
            </Text>
          )}
          <Text style={[styles.pillTime, { color: colors.primaryDark }]}>
            🕒 {item.time}
          </Text>
          <Text style={[styles.pillRange, { color: colors.textMuted }]}>
            {rangeLabel}
          </Text>
        </View>
      </View>
      {item.taken ? (
        <TouchableOpacity
          style={[
            styles.btnAction,
            styles.btnTaken,
            { backgroundColor: colors.background },
          ]}
          onPress={() => onTakePill(item.id)}
        >
          <Text style={[styles.btnTakenText, { color: colors.primary }]}>
            ✓ Taken
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.btnAction,
            styles.btnTake,
            { backgroundColor: colors.primaryDark },
          ]}
          onPress={() => onTakePill(item.id)}
        >
          <Text style={[styles.btnTakeText, { color: colors.white }]}>
            Take
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    minHeight: 100,
  },
  pillCardTaken: {},
  pillInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  pillName: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  pillNameTaken: { textDecorationLine: "line-through" },
  pillInfo: { fontSize: 15 },
  pillTime: { fontSize: 13, fontWeight: "500", marginTop: 4 },
  pillRange: { fontSize: 11, marginTop: 2 },
  btnAction: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 90,
    alignItems: "center",
  },
  btnTake: {},
  btnTakeText: { fontSize: 15, fontWeight: "600" },
  btnTaken: {},
  btnTakenText: { fontSize: 15, fontWeight: "700" },
});
