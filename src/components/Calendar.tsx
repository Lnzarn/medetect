import { useAppColors } from '@/lib/theme';
import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarCell =
  | { isEmpty: true; id: string }
  | { isEmpty: false; id: string; dayNum: number; iso: string; status: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedDateISO: string;
  onSelectDate: (iso: string) => void;
};

export default function CalendarModal({
  visible,
  onClose,
  selectedDateISO,
  onSelectDate,
}: Props) {
  const colors = useAppColors();
  const initialDate = new Date();
  const [calendarYear, setCalendarYear] = useState(initialDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(initialDate.getMonth());

  const formatToISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const monthlyCells = useMemo(() => {
    const cells: CalendarCell[] = [];
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isEmpty: true, id: `empty-${i}` });
    }
    for (let day = 1; day <= totalDays; day++) {
      const curDate = new Date(calendarYear, calendarMonth, day);
      const iso = formatToISO(curDate);
      const status =
        Math.random() > 0.5
          ? "complete"
          : day % 5 === 0
            ? "none"
            : "incomplete";
      cells.push({ isEmpty: false, id: iso, dayNum: day, iso, status });
    }
    while (cells.length < 42) {
      cells.push({ isEmpty: true, id: `trailing-${cells.length}` });
    }
    return cells;
  }, [calendarYear, calendarMonth]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 28, color: colors.text }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => setCalendarMonth((m) => {
                if (m === 0) {
                  setCalendarYear((y) => y - 1);
                  return 11;
                }
                return m - 1;
              })}
            >
              <Text style={[styles.monthNavButton, { color: colors.primaryDark }]}>← Prev</Text>
            </TouchableOpacity>
            <Text style={[styles.monthNavTitle, { color: colors.text }]}>
              {new Date(calendarYear, calendarMonth).toLocaleDateString(
                "default",
                { month: "long", year: "numeric" }
              )}
            </Text>
            <TouchableOpacity
              onPress={() => setCalendarMonth((m) => {
                if (m === 11) {
                  setCalendarYear((y) => y + 1);
                  return 0;
                }
                return m + 1;
              })}
            >
              <Text style={[styles.monthNavButton, { color: colors.primaryDark }]}>Next →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {WEEKDAYS_SHORT.map((day) => (
              <Text key={day} style={styles.monthWeekdayHeader}>
                {day}
              </Text>
            ))}
            {monthlyCells.map((cell) => (
              <TouchableOpacity
                key={cell.id}
                style={[
                  styles.monthDayCell,
                  !cell.isEmpty &&
                  cell.id === selectedDateISO &&
                  styles.monthDayCellSelected,
                ]}
                onPress={() => {
                  if (!cell.isEmpty) {
                    onSelectDate(cell.iso);
                    onClose();
                  }
                }}
              >
                {!cell.isEmpty && (
                  <>
                    <Text
                      style={[
                        styles.monthDayCellText,
                        { color: colors.text },
                        cell.id === selectedDateISO && { color: colors.white },
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                    {cell.status === "complete" && (
                      <View style={[styles.dotIndicator, styles.dotComplete]} />
                    )}
                    {cell.status === "incomplete" && (
                      <View
                        style={[styles.dotIndicator, styles.dotIncomplete]}
                      />
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthNavButton: {
    fontSize: 13,
    fontWeight: "600",
  },
  monthNavTitle: { fontSize: 15, fontWeight: "700" },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  monthWeekdayHeader: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    paddingBottom: 10,
    textTransform: "uppercase",
  },
  monthDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginBottom: 6,
  },
  monthDayCellSelected: {},
  monthDayCellText: { fontSize: 14, fontWeight: "600" },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 4,
  },
  dotComplete: { backgroundColor: "#28a745" },
  dotIncomplete: { backgroundColor: "#fd7e14" },
});
