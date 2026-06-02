import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import Colors from "../constants/colors";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  initialTime: string; // "HH:MM" format
};

export default function TimePickerModal({
  visible,
  onClose,
  onSave,
  initialTime,
}: Props) {
  const [tempHour, setTempHour] = useState("09");
  const [tempMinute, setTempMinute] = useState("00");

  useEffect(() => {
    if (visible) {
      const [h, m] = initialTime.split(":");
      setTempHour(h || "09");
      setTempMinute(m || "00");
    }
  }, [visible, initialTime]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerBox}>
          <Text style={styles.pickerTitle}>Select Time</Text>
          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Hour</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={`h-${h}`}
                    style={[
                      styles.pickerItem,
                      tempHour === h && styles.pickerItemActive,
                    ]}
                    onPress={() => setTempHour(h)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        tempHour === h && styles.pickerItemTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.pickerColon}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerColumnLabel}>Minute</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={`m-${m}`}
                    style={[
                      styles.pickerItem,
                      tempMinute === m && styles.pickerItemActive,
                    ]}
                    onPress={() => setTempMinute(m)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        tempMinute === m && styles.pickerItemTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.pickerActionRow}>
            <TouchableOpacity style={styles.pickerBtnCancel} onPress={onClose}>
              <Text style={styles.pickerBtnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerBtnSave}
              onPress={() => onSave(`${tempHour}:${tempMinute}`)}
            >
              <Text style={styles.pickerBtnSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBox: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.text,
  },
  pickerRow: { flexDirection: "row", alignItems: "center", height: 200 },
  pickerColumn: { flex: 1, alignItems: "center" },
  pickerColumnLabel: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 8,
    fontWeight: "600",
  },
  pickerScroll: { width: "100%" },
  pickerItem: { paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  pickerItemActive: { backgroundColor: Colors.lightBlue },
  pickerItemText: { fontSize: 20, color: Colors.grey, fontWeight: "500" },
  pickerItemTextActive: {
    color: Colors.primaryDark,
    fontWeight: "700",
    fontSize: 24,
  },
  pickerColon: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  pickerActionRow: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
    justifyContent: "space-between",
  },
  pickerBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  pickerBtnCancelText: { color: Colors.grey, fontWeight: "600", fontSize: 16 },
  pickerBtnSave: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
    alignItems: "center",
  },
  pickerBtnSaveText: { color: Colors.white, fontWeight: "600", fontSize: 16 },
});
