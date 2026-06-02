import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constants/colors";

export type MedicationItem = {
  id: number;
  name: string;
  info: string;
  time: string;
  taken: boolean;
};

type Props = {
  item: MedicationItem;
  onTakePill: (id: number) => void;
};

export default function MedicationCard({ item, onTakePill }: Props) {
  return (
    <View style={[styles.pillCard, item.taken && styles.pillCardTaken]}>
      <View style={styles.pillInfoWrapper}>
        <View>
          <Text style={[styles.pillName, item.taken && styles.pillNameTaken]}>
            {item.name}
          </Text>
          <Text style={styles.pillInfo}>{item.info}</Text>
          <Text style={styles.pillTime}>🕒 {item.time}</Text>
        </View>
      </View>
      {item.taken ? (
        <View style={[styles.btnAction, styles.btnTaken]}>
          <Text style={styles.btnTakenText}>✓ Taken</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.btnAction, styles.btnTake]}
          onPress={() => onTakePill(item.id)}
        >
          <Text style={styles.btnTakeText}>Take</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pillCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    minHeight: 100,
  },
  pillCardTaken: { backgroundColor: Colors.white, borderColor: Colors.greyTrack },
  pillInfoWrapper: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  pillName: { fontSize: 18, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  pillNameTaken: { color: Colors.grey, textDecorationLine: "line-through" },
  pillInfo: { fontSize: 15, color: Colors.grey },
  pillTime: { fontSize: 13, color: Colors.primaryDark, fontWeight: "500", marginTop: 4 },
  btnAction: { borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, minWidth: 90, alignItems: "center" },
  btnTake: { backgroundColor: Colors.primaryDark },
  btnTakeText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  btnTaken: { backgroundColor: "#e8f5e9" },
  btnTakenText: { color: "#28a745", fontSize: 15, fontWeight: "700" },
});