import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import Loading from "../components/Loading";
import StepBar from "../components/StepBar";
import Colors from "../constants/colors";
import { ClusterKey } from "../engine/clusters";
import { getQuestion } from "../engine/questions";
import { initSession, processAnswer } from "../engine/session";
import { Answer, SessionState } from "../engine/types";

const C = Colors;

export default function QuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as ClusterKey) ?? "general";

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const sessionRef = useRef<SessionState | null>(null);

  // Initialize session on mount
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
  }, []);

  const handleContinue = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionRef.current) return;

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
        // Session complete → go to results
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

  const handleBottomNav = (key: string) => {
    if (key === "calendar") router.push("/pill_sched");
  };

  const questionNumber = (sessionRef.current?.questionCount ?? 0) + 1;
  const questionText = currentQuestion ? getQuestion(currentQuestion) : "";

  // Full screen loading on init
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Loading message="Preparing your assessment..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.topSection}>
        <StepBar step={2} total={3} />
        <Text style={styles.title}>FOLLOW-UP{"\n"}QUESTIONS</Text>
      </View>

      <View style={styles.content}>
        {processing ? (
          // Inline loading while processing answer
          <View style={styles.processingWrapper}>
            <Loading size={60} message="Analyzing your answer..." />
          </View>
        ) : (
          <View style={styles.questionCard}>
            <View style={styles.questionTextWrapper}>
              <Text style={styles.questionEyebrow}>
                QUESTION #{questionNumber}
              </Text>
              <Text style={styles.questionText}>{questionText}</Text>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  styles.btnYes,
                  selectedAnswer === 1 && styles.btnYesSelected,
                ]}
                onPress={() => setSelectedAnswer(1)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    selectedAnswer === 1
                      ? styles.btnYesTextSelected
                      : styles.btnYesText,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  styles.btnUnsure,
                  selectedAnswer === 0 && styles.btnUnsureSelected,
                ]}
                onPress={() => setSelectedAnswer(0)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    selectedAnswer === 0
                      ? styles.btnUnsureTextSelected
                      : styles.btnUnsureText,
                  ]}
                >
                  Not Sure
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  styles.btnNo,
                  selectedAnswer === -1 && styles.btnNoSelected,
                ]}
                onPress={() => setSelectedAnswer(-1)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    selectedAnswer === -1
                      ? styles.btnNoTextSelected
                      : styles.btnNoText,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!selectedAnswer === null || processing) &&
              styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={selectedAnswer === null || processing}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  loadingScreen: {
    flex: 1,
    backgroundColor: C.white,
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
    color: C.text,
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
    borderColor: C.text,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 22,
    backgroundColor: C.white,
    marginTop: 10,
    marginBottom: 5,
    justifyContent: "space-between",
  },
  questionTextWrapper: { flex: 1 },
  questionEyebrow: {
    fontSize: 13,
    fontWeight: "800",
    color: C.primary,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "900",
    color: C.text,
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
  btnYes: { backgroundColor: C.white, borderColor: C.primary },
  btnYesSelected: { backgroundColor: C.primary, borderColor: C.primary },
  btnYesText: { color: C.primary },
  btnYesTextSelected: { color: C.white },
  // Not Sure
  btnUnsure: { backgroundColor: C.white, borderColor: Colors.greyLight },
  btnUnsureSelected: {
    backgroundColor: Colors.greyLight,
    borderColor: Colors.greyLight,
  },
  btnUnsureText: { color: C.text },
  btnUnsureTextSelected: { color: C.text },
  // No
  btnNo: { backgroundColor: C.white, borderColor: C.text },
  btnNoSelected: { backgroundColor: C.text, borderColor: C.text },
  btnNoText: { color: C.text },
  btnNoTextSelected: { color: C.white },

  optionBtnText: { fontSize: 15, fontWeight: "700" },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: C.white,
  },
  continueBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.greyLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
