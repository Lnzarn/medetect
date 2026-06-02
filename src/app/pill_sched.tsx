import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";

// Constants & Styles
import Colors from "../constants/colors";
import sharedStyles from "../constants/sharedStyles";

// Components
import BottomNav from "../components/BottomNav";
import MedicationCard, { type MedicationItem } from "../components/MedicationCard";
import ProgressMetrics from "../components/PillProgress";
import CalendarModal from "../components/Calendar";
import TimePickerModal from "../components/TimePicker";

const MOCK_MEDICATIONS: MedicationItem[] = [];

export default function PillSched() {
  const router = useRouter();

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

  // State
  const [selectedDateISO, setSelectedDateISO] = useState(formatToISO(new Date()));
  const selectedDateReadable = formatISOToReadable(selectedDateISO);
  const [isMedModalVisible, setIsMedModalVisible] = useState(false);
  const [isCalModalVisible, setIsCalModalVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  // Form State
  const [medName, setMedName] = useState("");
  const [medInfo, setMedInfo] = useState("");
  const [medTime, setMedTime] = useState("09:00");

  const activeDayItems = MOCK_MEDICATIONS;

  const metrics = useMemo(() => {
    const total = activeDayItems.length;
    const taken = activeDayItems.filter((item) => item.taken).length;
    return { taken, total, percentage: total === 0 ? 0 : (taken / total) * 100 };
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
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerDateText}>{selectedDateReadable}</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
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

      {/* Floating Buttons */}
      <TouchableOpacity style={styles.fabCal} onPress={() => setIsCalModalVisible(true)} activeOpacity={0.8}>
        <Text style={{ fontSize: 22 }}>📅</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={() => setIsMedModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <BottomNav />

      {/* Extracted Modals */}
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

      {/* Add Medication Modal */}
     {/* Add Medication Modal */}
      <Modal visible={isMedModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding" // Use padding for BOTH platforms; it animates smoother for bottom sheets
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={Keyboard.dismiss}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalSheetTitle}>Add Medication</Text>
                  <TouchableOpacity onPress={() => setIsMedModalVisible(false)}>
                    <Text style={{ fontSize: 28, color: Colors.text }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  // Added paddingBottom here so the button isn't hugging the keyboard
                  contentContainerStyle={{ paddingBottom: 24 }} 
                >
                  <Text style={sharedStyles.label}>Medication Name</Text>
                  <TextInput
                    style={sharedStyles.input}
                    placeholder="e.g. Aspirin"
                    placeholderTextColor={Colors.greyLight}
                    value={medName}
                    onChangeText={setMedName}
                  />

                  <Text style={sharedStyles.label}>Dosage / Info</Text>
                  <TextInput
                    style={sharedStyles.input}
                    placeholder="e.g. 100mg tablet"
                    placeholderTextColor={Colors.greyLight}
                    value={medInfo}
                    onChangeText={setMedInfo}
                  />

                  <Text style={sharedStyles.label}>Time (HH:MM)</Text>
                  <TouchableOpacity
                    style={[
                      sharedStyles.input,
                      { alignItems: "center", paddingVertical: 14, marginBottom: 40 },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss(); 
                      setShowCustomTimePicker(true);
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "600", color: Colors.text }}>
                      {medTime}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[sharedStyles.button, { width: '100%' }]}
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBorder,
  },
  iconButton: { width: 40, height: 40 },
  headerTitleWrap: { alignItems: "center", marginTop: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  headerDateText: { fontSize: 12, color: Colors.grey, marginTop: 8 },
  scrollArea: { padding: 16, paddingBottom: 200 },
  timeDivider: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginVertical: 20,
    marginTop: 28,
  },
  emptyState: {
    fontSize: 13,
    color: Colors.greyLight,
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
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { fontSize: 28, color: Colors.white, fontWeight: "300" },
  fabCal: {
    position: "absolute",
    bottom: 188,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.white,
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
  modalSheetTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
});