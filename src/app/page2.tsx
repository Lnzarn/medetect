import { useAppColors } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import Loading from "../components/Loading";
import StepBar from "../components/StepBar";
import { ClusterKey } from "../engine/clusters";
import { getQuestion } from "../engine/questions";
import { initSession, processAnswer } from "../engine/session";
import { Answer, SessionState } from "../engine/types";

export default function QuestionScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as ClusterKey) ?? "general";

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const sessionRef = useRef<SessionState | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { state, firstQuestion } = await initSession(category);
        sessionRef.current = state;
        setCurrentQuestion(firstQuestion);
      } catch (err) {
        console.error("[QuestionScreen] init failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [category]);

  const handleContinue = async () => {
    if (selectedAnswer === null || !currentQuestion || !sessionRef.current)
      return;

    setProcessing(true);
    try {
      const { state, nextQuestion, result } = await processAnswer(
        sessionRef.current,
        currentQuestion,
        selectedAnswer,
      );

      sessionRef.current = state;
      setSelectedAnswer(null);

      if (result) {
        const encoded = encodeURIComponent(JSON.stringify(result));
        router.push(`/results?result=${encoded}`);
      } else if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      }
    } catch (err) {
      console.error("[QuestionScreen] processAnswer failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleBottomNav = (_key: string) => {
    // no-op: BottomNav performs routing centrally
  };

  const questionNumber = (sessionRef.current?.questionCount ?? 0) + 1;
  const questionText = currentQuestion ? getQuestion(currentQuestion) : "";

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.loadingScreen, { backgroundColor: colors.background }]}
      >
        <Loading message="Preparing your assessment..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.text === "#FFFFFF" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.topSection}>
        <StepBar step={2} total={3} />
        <Text style={[styles.title, { color: colors.text }]}>
          FOLLOW-UP{"\n"}QUESTIONS
        </Text>
      </View>

      <View style={styles.content}>
        {processing ? (
          <View style={styles.processingWrapper}>
            <Loading size={60} message="Analyzing your answer..." />
          </View>
        ) : (
          <View style={styles.questionCard}>
            <View style={styles.questionTextWrapper}>
              <Text style={[styles.questionEyebrow, { color: colors.primary }]}>
                QUESTION #{questionNumber}
              </Text>
              <Text style={[styles.questionText, { color: colors.text }]}>
                {questionText}
              </Text>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                  },
                  selectedAnswer === 1 && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedAnswer(1)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    {
                      color: selectedAnswer === 1 ? "#FFFFFF" : colors.primary,
                    },
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: colors.elementBg,
                    borderColor: colors.border,
                  },
                  selectedAnswer === 0 && {
                    backgroundColor: "#6B7280",
                    borderColor: "#6B7280",
                  },
                ]}
                onPress={() => setSelectedAnswer(0)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    {
                      color:
                        selectedAnswer === 0 ? "#FFFFFF" : colors.textMuted,
                    },
                  ]}
                >
                  Not Sure
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.text,
                  },
                  selectedAnswer === -1 && {
                    backgroundColor: colors.text,
                    borderColor: colors.text,
                  },
                ]}
                onPress={() => setSelectedAnswer(-1)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    { color: selectedAnswer === -1 ? "#FFFFFF" : colors.text },
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            (selectedAnswer === null || processing) &&
              styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={selectedAnswer === null || processing}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  processingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 22,
    marginTop: 10,
    marginBottom: 5,
    justifyContent: "space-between",
  },
  questionTextWrapper: { flex: 1 },
  questionEyebrow: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 32,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 32,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  // Yes
  btnYes: { borderWidth: 2 },
  btnYesSelected: {},
  btnYesText: { fontWeight: "700" },
  btnYesTextSelected: { fontWeight: "700" },
  // Not Sure
  btnUnsure: { borderWidth: 2 },
  btnUnsureSelected: {},
  btnUnsureText: { fontWeight: "700" },
  btnUnsureTextSelected: { fontWeight: "700" },
  // No
  btnNo: { borderWidth: 2 },
  btnNoSelected: {},
  btnNoText: { fontWeight: "700" },
  btnNoTextSelected: { fontWeight: "700" },

  optionBtnText: { fontSize: 15, fontWeight: "700" },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 130,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  continueBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
