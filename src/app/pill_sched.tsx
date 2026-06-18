import { useAppColors } from "@/lib/theme";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useSharedStyles from "../constants/sharedStyles";

import BottomNav from "../components/BottomNav";
import CalendarModal from "../components/Calendar";
import MedicationCard, {
  type MedicationItem,
} from "../components/MedicationCard";
import ProgressMetrics from "../components/PillProgress";
import TimePickerModal from "../components/TimePicker";

const MOCK_MEDICATIONS: MedicationItem[] = [];

export default function PillSched() {
  const sharedStyles = useSharedStyles();
  const colors = useAppColors();

  // Helper formats
  const formatToISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatISOToReadable = (iso: string): string => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("default", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [selectedDateISO, setSelectedDateISO] = useState(
    formatToISO(new Date()),
  );
  const selectedDateReadable = formatISOToReadable(selectedDateISO);
  const [isMedModalVisible, setIsMedModalVisible] = useState(false);
  const [isCalModalVisible, setIsCalModalVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const [medName, setMedName] = useState("");
  const [medInfo, setMedInfo] = useState("");
  const [medTime, setMedTime] = useState("09:00");

  const activeDayItems = MOCK_MEDICATIONS;

  const metrics = useMemo(() => {
    const total = activeDayItems.length;
    const taken = activeDayItems.filter((item) => item.taken).length;
    return {
      taken,
      total,
      percentage: total === 0 ? 0 : (taken / total) * 100,
    };
  }, [activeDayItems]);

  const handleCreateMedication = () => {
    if (!medName.trim() || !medInfo.trim() || !medTime.trim()) {
      Alert.alert("Error", "Please fill in all form inputs.");
      return;
    }
    Alert.alert("Note", "Database functionality removed for UI view.");
    setMedName("");
    setMedInfo("");
    setMedTime("09:00");
    setIsMedModalVisible(false);
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Schedule
          </Text>
          <Text style={[styles.headerDateText, { color: colors.textMuted }]}>
            {selectedDateReadable}
          </Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <ProgressMetrics {...metrics} />

        <Text style={styles.timeDivider}>Schedule</Text>

        {activeDayItems.length === 0 ? (
          <Text style={styles.emptyState}>No items scheduled</Text>
        ) : (
          [...activeDayItems]
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((item) => (
              <MedicationCard
                key={item.id}
                item={item}
                onTakePill={(id) => Alert.alert("Note", "UI only.")}
              />
            ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fabCal,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setIsCalModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 22, color: colors.text }}>📅</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primaryDark }]}
        onPress={() => setIsMedModalVisible(true)}
      >
        <Text style={[styles.fabText, { color: colors.white }]}>+</Text>
      </TouchableOpacity>

      <BottomNav />

      <CalendarModal
        visible={isCalModalVisible}
        onClose={() => setIsCalModalVisible(false)}
        selectedDateISO={selectedDateISO}
        onSelectDate={setSelectedDateISO}
      />

      <TimePickerModal
        visible={showCustomTimePicker}
        onClose={() => setShowCustomTimePicker(false)}
        initialTime={medTime}
        onSave={(time) => {
          setMedTime(time);
          setShowCustomTimePicker(false);
        }}
      />

      <Modal visible={isMedModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalSheetTitle, { color: colors.text }]}
                  >
                    Add Medication
                  </Text>
                  <TouchableOpacity onPress={() => setIsMedModalVisible(false)}>
                    <Text style={{ fontSize: 28, color: colors.text }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  <Text style={[sharedStyles.label, { color: colors.text }]}>
                    Medication Name
                  </Text>
                  <TextInput
                    style={[
                      sharedStyles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g. Aspirin"
                    placeholderTextColor={colors.textMuted}
                    value={medName}
                    onChangeText={setMedName}
                  />

                  <Text style={[sharedStyles.label, { color: colors.text }]}>
                    Dosage / Info
                  </Text>
                  <TextInput
                    style={[
                      sharedStyles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g. 100mg tablet"
                    placeholderTextColor={colors.textMuted}
                    value={medInfo}
                    onChangeText={setMedInfo}
                  />

                  <Text style={[sharedStyles.label, { color: colors.text }]}>
                    Time (HH:MM)
                  </Text>
                  <TouchableOpacity
                    style={[
                      sharedStyles.input,
                      {
                        alignItems: "center",
                        paddingVertical: 14,
                        marginBottom: 40,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowCustomTimePicker(true);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                    >
                      {medTime}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[sharedStyles.button, { width: "100%" }]}
                    onPress={handleCreateMedication}
                  >
                    <Text style={sharedStyles.buttonText}>Add Medication</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  iconButton: { width: 40, height: 40 },
  headerTitleWrap: { alignItems: "center", marginTop: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerDateText: { fontSize: 12, marginTop: 8 },
  scrollArea: { padding: 16, paddingBottom: 200 },
  timeDivider: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginVertical: 20,
    marginTop: 28,
  },
  emptyState: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  fab: {
    position: "absolute",
    bottom: 120,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { fontSize: 28, fontWeight: "300" },
  fabCal: {
    position: "absolute",
    bottom: 188,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalSheetTitle: { fontSize: 18, fontWeight: "700" },
});
