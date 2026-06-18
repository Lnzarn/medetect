import { getMonthStatusMap, type DayStatus } from "@/lib/medications";
import { useAppColors } from "@/lib/theme";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarCell =
  | { isEmpty: true; id: string }
  | { isEmpty: false; id: string; dayNum: number; iso: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedDateISO: string;
  onSelectDate: (iso: string) => void;
  userId?: string | null;

  showStatus?: boolean;
  title?: string;

  minDateISO?: string;
};

export default function CalendarModal({
  visible,
  onClose,
  selectedDateISO,
  onSelectDate,
  userId = null,
  showStatus = true,
  title = "Select Date",
  minDateISO,
}: Props) {
  const colors = useAppColors();
  const initialDate = new Date();
  const [calendarYear, setCalendarYear] = useState(initialDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(initialDate.getMonth());
  const [statusMap, setStatusMap] = useState<Record<string, DayStatus>>({});

  const formatToISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (!visible || !showStatus || !userId) {
      setStatusMap({});
      return;
    }
    let cancelled = false;
    getMonthStatusMap(userId, calendarYear, calendarMonth)
      .then((map) => {
        if (!cancelled) setStatusMap(map);
      })
      .catch((e) => console.warn("Failed to load schedule status:", e));
    return () => {
      cancelled = true;
    };
  }, [visible, showStatus, userId, calendarYear, calendarMonth]);

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
      cells.push({ isEmpty: false, id: iso, dayNum: day, iso });
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
            <Text style={[styles.modalSheetTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 28, color: colors.text }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() =>
                setCalendarMonth((m) => {
                  if (m === 0) {
                    setCalendarYear((y) => y - 1);
                    return 11;
                  }
                  return m - 1;
                })
              }
            >
              <Text
                style={[styles.monthNavButton, { color: colors.primaryDark }]}
              >
                ← Prev
              </Text>
            </TouchableOpacity>
            <Text style={[styles.monthNavTitle, { color: colors.text }]}>
              {new Date(calendarYear, calendarMonth).toLocaleDateString(
                "default",
                { month: "long", year: "numeric" },
              )}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCalendarMonth((m) => {
                  if (m === 11) {
                    setCalendarYear((y) => y + 1);
                    return 0;
                  }
                  return m + 1;
                })
              }
            >
              <Text
                style={[styles.monthNavButton, { color: colors.primaryDark }]}
              >
                Next →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {WEEKDAYS_SHORT.map((day) => (
              <Text key={day} style={styles.monthWeekdayHeader}>
                {day}
              </Text>
            ))}
            {monthlyCells.map((cell) => {
              const disabled =
                !cell.isEmpty && !!minDateISO && cell.iso < minDateISO;
              const status: DayStatus =
                !cell.isEmpty && showStatus
                  ? (statusMap[cell.iso] ?? "none")
                  : "none";

              return (
                <TouchableOpacity
                  key={cell.id}
                  disabled={disabled}
                  style={[
                    styles.monthDayCell,
                    !cell.isEmpty &&
                      cell.id === selectedDateISO && {
                        backgroundColor: colors.primaryDark,
                      },
                  ]}
                  onPress={() => {
                    if (!cell.isEmpty && !disabled) {
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
                          { color: disabled ? colors.textMuted : colors.text },
                          cell.id === selectedDateISO && {
                            color: colors.white,
                          },
                        ]}
                      >
                        {cell.dayNum}
                      </Text>
                      {status === "complete" && (
                        <View
                          style={[styles.dotIndicator, styles.dotComplete]}
                        />
                      )}
                      {status === "incomplete" && (
                        <View
                          style={[styles.dotIndicator, styles.dotIncomplete]}
                        />
                      )}
                      {status === "scheduled" && (
                        <View
                          style={[
                            styles.dotIndicator,
                            styles.dotScheduled,
                            { backgroundColor: colors.primaryDark },
                          ]}
                        />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {showStatus && (
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.dotIndicator,
                    styles.dotComplete,
                    styles.legendDot,
                  ]}
                />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>
                  All taken
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.dotIndicator,
                    styles.dotIncomplete,
                    styles.legendDot,
                  ]}
                />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>
                  Missed
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.dotIndicator,
                    styles.dotScheduled,
                    styles.legendDot,
                    { backgroundColor: colors.primaryDark },
                  ]}
                />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>
                  Upcoming
                </Text>
              </View>
            </View>
          )}
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
  dotIncomplete: { backgroundColor: "#dc3545" },
  dotScheduled: {},
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    position: "relative",
    bottom: 0,
    marginRight: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: { fontSize: 11, fontWeight: "600" },
});
