import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth";
import {
    AssessmentHistoryRow,
    clearAllAssessments,
    deleteAssessment,
    getAssessmentHistory,
} from "@/lib/history";
import { useAppColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_LABELS: Record<string, string> = {
  respiratory: "Respiratory",
  cardiovascular: "Cardiovascular",
  gastrointestinal: "Gastrointestinal",
  neurological: "Neurological",
  musculoskeletal: "Bone & Joint",
  dermatological: "Skin",
  general: "General",
};

const STOPPED_LABELS: Record<AssessmentHistoryRow["stopped_reason"], string> = {
  threshold_met: "Confident match",
  max_questions: "Max questions reached",
  no_more_questions: "All questions asked",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryCard({
  item,
  onDelete,
  onPress,
}: {
  item: AssessmentHistoryRow;
  onDelete: (id: number) => void;
  onPress: (item: AssessmentHistoryRow) => void;
}) {
  const colors = useAppColors();
  const top = item.top_matches[0];
  const topPct = top ? Math.round(top.confidence * 100) : 0;

  const borderColor = item.is_emergency
    ? "#DC2626"
    : topPct >= 80
      ? "#EF4444"
      : topPct >= 60
        ? "#F59E0B"
        : "#10B981";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.elementBg, borderLeftColor: borderColor },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>
            {formatDate(item.assessed_at)}
          </Text>
          <Text style={[styles.cardCategory, { color: colors.text }]}>
            {CATEGORY_LABELS[item.category] ?? item.category}
            {item.is_emergency ? "  🚨" : ""}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.deleteBtn, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {item.top_matches.slice(0, 3).map((m, i) => (
        <View key={m.disease} style={styles.matchRow}>
          <Text style={[styles.matchRank, { color: colors.primary }]}>
            #{i + 1}
          </Text>
          <Text style={[styles.matchName, { color: colors.text }]}>
            {m.disease}
          </Text>
          <Text style={[styles.matchPct, { color: colors.primary }]}>
            {Math.round(m.confidence * 100)}%
          </Text>
        </View>
      ))}

      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {STOPPED_LABELS[item.stopped_reason]} · {item.questions_asked} questions
        · {item.confidence_level}
      </Text>
    </TouchableOpacity>
  );
}

export default function AssessmentHistoryScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { session, isGuest } = useAuth();

  const [history, setHistory] = useState<AssessmentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const rows = await getAssessmentHistory(session.user.id);
      setHistory(rows);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: number) => {
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const target = history.find((h) => h.id === id);
          await deleteAssessment(id, target?.remote_id ?? null);
          setHistory((prev) => prev.filter((h) => h.id !== id));
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (!session?.user?.id) return;
    Alert.alert(
      "Clear all history?",
      "This will delete all saved assessments.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllAssessments(session.user.id);
            setHistory([]);
          },
        },
      ],
    );
  };

  const handleCardPress = (item: AssessmentHistoryRow) => {
    const result = {
      topMatches: item.top_matches,
      isEmergency: item.is_emergency,
      stoppedReason: item.stopped_reason,
      totalQuestionsAsked: item.questions_asked,
    };
    router.push(
      `/results?result=${encodeURIComponent(JSON.stringify(result))}&category=${item.category}&readonly=1`,
    );
  };

  if (isGuest) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyIcon]}>🔒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Log in to view history
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Assessment history is only available to logged-in users.
          </Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>HISTORY</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearAll, { color: "#EF4444" }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No assessments yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Save an assessment after completing it to see it here.
          </Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/page1")}
          >
            <Text style={[styles.startBtnText, { color: colors.white }]}>
              Start Assessment
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onDelete={handleDelete}
              onPress={handleCardPress}
            />
          )}
        />
      )}

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { marginRight: 12 },
  backArrow: { fontSize: 22, fontWeight: "700" },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  clearAll: { fontSize: 13, fontWeight: "700" },

  list: {
    paddingHorizontal: 22,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardDate: { fontSize: 11, marginBottom: 2 },
  cardCategory: { fontSize: 15, fontWeight: "800" },
  deleteBtn: { fontSize: 16, fontWeight: "700" },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchRank: { fontSize: 12, fontWeight: "900", width: 22 },
  matchName: { flex: 1, fontSize: 13, fontWeight: "600" },
  matchPct: { fontSize: 13, fontWeight: "700" },

  cardMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  startBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startBtnText: { fontSize: 14, fontWeight: "700" },
});
