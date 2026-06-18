import { useAuth } from "@/lib/auth";
import {
  addMedication,
  deleteMedicationById,
  getScheduleForDate,
  setMedicationTaken,
} from "@/lib/medications";
import { useAppColors } from "@/lib/theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
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

const formatISOShort = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PillSched() {
  const sharedStyles = useSharedStyles();
  const colors = useAppColors();
  const { session, isGuest } = useAuth();
  const userId = session?.user?.id ?? null;

  const [selectedDateISO, setSelectedDateISO] = useState(
    formatToISO(new Date()),
  );
  const selectedDateReadable = formatISOToReadable(selectedDateISO);

  const [isMedModalVisible, setIsMedModalVisible] = useState(false);
  const [isCalModalVisible, setIsCalModalVisible] = useState(false);
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const [medName, setMedName] = useState("");
  const [medInfo, setMedInfo] = useState("");
  const [medTime, setMedTime] = useState("09:00");
  const [medStartDate, setMedStartDate] = useState(formatToISO(new Date()));
  const [noEndDate, setNoEndDate] = useState(true);
  const [medEndDate, setMedEndDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [scheduleItems, setScheduleItems] = useState<MedicationItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const loadSchedule = useCallback(async () => {
    if (!userId) {
      setScheduleItems([]);
      return;
    }
    setLoadingSchedule(true);
    try {
      const items = await getScheduleForDate(userId, selectedDateISO);
      setScheduleItems(items);
    } catch (e) {
      console.error("Failed to load schedule:", e);
    } finally {
      setLoadingSchedule(false);
    }
  }, [userId, selectedDateISO]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const backgroundSync = useCallback(() => {
    if (!userId) return;
    import("@/lib/sync")
      .then(({ syncAll }) => syncAll(userId))
      .catch((e) => console.warn("Background sync failed:", e));
  }, [userId]);

  const activeDayItems = scheduleItems;

  const metrics = useMemo(() => {
    const total = activeDayItems.length;
    const taken = activeDayItems.filter((item) => item.taken).length;
    return {
      taken,
      total,
      percentage: total === 0 ? 0 : (taken / total) * 100,
    };
  }, [activeDayItems]);

  const resetForm = () => {
    setMedName("");
    setMedInfo("");
    setMedTime("09:00");
    setMedStartDate(formatToISO(new Date()));
    setNoEndDate(true);
    setMedEndDate(null);
  };

  const handleCreateMedication = async () => {
    if (!userId) {
      Alert.alert("Log in required", "Please log in to add a pill schedule.");
      return;
    }
    if (!medName.trim() || !medTime.trim()) {
      Alert.alert("Error", "Please enter a medication name and time.");
      return;
    }
    if (!medStartDate) {
      Alert.alert("Error", "Please choose a start date.");
      return;
    }
    if (!noEndDate) {
      if (!medEndDate) {
        Alert.alert(
          "Error",
          'Please choose an end date, or turn on "No end date".',
        );
        return;
      }
      if (medEndDate < medStartDate) {
        Alert.alert("Error", "The end date can't be before the start date.");
        return;
      }
    }

    try {
      setSaving(true);
      await addMedication({
        userId,
        name: medName.trim(),
        info: medInfo.trim(),
        time: medTime,
        startDate: medStartDate,
        endDate: noEndDate ? null : medEndDate,
      });

      resetForm();
      setIsMedModalVisible(false);
      await loadSchedule();
      backgroundSync();
    } catch (e) {
      console.error("Failed to add medication:", e);
      Alert.alert("Error", "Could not save this medication. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTakePill = async (id: number) => {
    if (!userId) return;
    const item = scheduleItems.find((i) => i.id === id);
    if (!item) return;
    const nextTaken = !item.taken;

    setScheduleItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, taken: nextTaken } : i)),
    );

    try {
      await setMedicationTaken(userId, id, selectedDateISO, nextTaken);
      backgroundSync();
    } catch (e) {
      console.error("Failed to update taken status:", e);
      setScheduleItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, taken: !nextTaken } : i)),
      );
      Alert.alert(
        "Error",
        "Could not update this medication. Please try again.",
      );
    }
  };

  const handleDeleteMedication = (id: number) => {
    const item = scheduleItems.find((i) => i.id === id);
    Alert.alert(
      "Delete medication?",
      item
        ? `Remove "${item.name}" from your schedule entirely?`
        : "Remove this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedicationById(id);
              setScheduleItems((prev) => prev.filter((i) => i.id !== id));
              backgroundSync();
            } catch (e) {
              console.error("Failed to delete medication:", e);
              Alert.alert("Error", "Could not delete this medication.");
            }
          },
        },
      ],
    );
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

        {isGuest || !userId ? (
          <Text style={styles.emptyState}>
            Log in to manage your pill schedule.
          </Text>
        ) : loadingSchedule ? (
          <Text style={styles.emptyState}>Loading…</Text>
        ) : activeDayItems.length === 0 ? (
          <Text style={styles.emptyState}>No items scheduled</Text>
        ) : (
          [...activeDayItems]
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((item) => (
              <MedicationCard
                key={item.id}
                item={item}
                onTakePill={handleTakePill}
                onDelete={handleDeleteMedication}
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
        onPress={() => {
          if (!userId) {
            Alert.alert(
              "Log in required",
              "Please log in to add a pill schedule.",
            );
            return;
          }
          setIsMedModalVisible(true);
        }}
      >
        <Text style={[styles.fabText, { color: colors.white }]}>+</Text>
      </TouchableOpacity>

      <BottomNav />

      <CalendarModal
        visible={isCalModalVisible}
        onClose={() => setIsCalModalVisible(false)}
        selectedDateISO={selectedDateISO}
        onSelectDate={setSelectedDateISO}
        userId={userId}
        title="Select Date"
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

      <CalendarModal
        visible={isStartDateModalVisible}
        onClose={() => setIsStartDateModalVisible(false)}
        selectedDateISO={medStartDate}
        onSelectDate={(iso) => {
          setMedStartDate(iso);
          if (medEndDate && medEndDate < iso) setMedEndDate(null);
        }}
        showStatus={false}
        title="Starts On"
      />

      <CalendarModal
        visible={isEndDateModalVisible}
        onClose={() => setIsEndDateModalVisible(false)}
        selectedDateISO={medEndDate ?? medStartDate}
        onSelectDate={setMedEndDate}
        showStatus={false}
        title="Ends On"
        minDateISO={medStartDate}
      />

      <Modal visible={isMedModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalSheet,
                  { backgroundColor: colors.background },
                ]}
              >
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
                    Dosage / Info (optional)
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

                  <Text style={[sharedStyles.label, { color: colors.text }]}>
                    Starts On
                  </Text>
                  <TouchableOpacity
                    style={[
                      sharedStyles.input,
                      {
                        alignItems: "center",
                        paddingVertical: 14,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsStartDateModalVisible(true);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                    >
                      {formatISOShort(medStartDate)}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.toggleRow}>
                    <Text
                      style={[
                        sharedStyles.label,
                        { color: colors.text, marginBottom: 0 },
                      ]}
                    >
                      No end date (ongoing)
                    </Text>
                    <Switch
                      value={noEndDate}
                      onValueChange={(v) => {
                        setNoEndDate(v);
                        if (v) setMedEndDate(null);
                      }}
                      trackColor={{
                        true: colors.primaryDark,
                        false: colors.border,
                      }}
                      thumbColor={colors.white}
                    />
                  </View>

                  {!noEndDate && (
                    <>
                      <Text
                        style={[sharedStyles.label, { color: colors.text }]}
                      >
                        Ends On
                      </Text>
                      <TouchableOpacity
                        style={[
                          sharedStyles.input,
                          {
                            alignItems: "center",
                            paddingVertical: 14,
                            marginBottom: 24,
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => {
                          Keyboard.dismiss();
                          setIsEndDateModalVisible(true);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          {medEndDate
                            ? formatISOShort(medEndDate)
                            : "Select end date"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={[
                      sharedStyles.button,
                      { width: "100%", marginTop: noEndDate ? 24 : 0 },
                      saving && { opacity: 0.6 },
                    ]}
                    onPress={handleCreateMedication}
                    disabled={saving}
                  >
                    <Text style={sharedStyles.buttonText}>
                      {saving ? "Saving…" : "Add Medication"}
                    </Text>
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
  scrollArea: { padding: 16, paddingBottom: 240 },
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
    bottom: 160,
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
    bottom: 228,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalSheetTitle: { fontSize: 18, fontWeight: "700" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
