import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import StepBar from "../components/StepBar";
import Colors from "../constants/colors";

// ─── Main Layout Wrapper ──────────────────────────────────────────────────────
interface ScreenLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  showFooter?: boolean;
  continueText?: string;
  onContinue?: () => void;
  isContinueDisabled?: boolean;
  onNavClick?: (key: string) => void;
}

export default function ScreenLayout({
  children,
  step,
  totalSteps = 3,
  title,
  subtitle,
  showFooter = true,
  continueText = "Continue  →",
  onContinue,
  isContinueDisabled = false,
  onNavClick,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header Area ── */}
      {(step || title || subtitle) && (
        <View style={styles.topSection}>
          {step && <StepBar step={step} total={totalSteps} />}
          {title && <Text style={styles.question}>{title}</Text>}
          {subtitle && <Text style={styles.instruction}>{subtitle}</Text>}
        </View>
      )}

      {/* ── Main Content Area ── */}
      <View style={styles.contentContainer}>{children}</View>

      {/* ── Footer / Continue Button ── */}
      {showFooter && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              isContinueDisabled && styles.continueBtnDisabled,
            ]}
            onPress={() => {
              if (isContinueDisabled) return;
              onContinue?.();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>{continueText}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Nav Bar ── */}
      <BottomNav onNavigate={onNavClick} />
    </View>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  instruction: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
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
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
