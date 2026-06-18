import { useAppColors } from '@/lib/theme';
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
  const colors = useAppColors();

  return (
    <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ── Header Area ── */}
      {(step || title || subtitle) && (
        <View style={[styles.topSection, { backgroundColor: colors.background }]}>
          {step && <StepBar step={step} total={totalSteps} />}
          {title && <Text style={[styles.question, { color: colors.text }]}>{title}</Text>}
          {subtitle && <Text style={[styles.instruction, { color: colors.text }]}>{subtitle}</Text>}
        </View>
      )}

      {/* ── Main Content Area ── */}
      <View style={styles.contentContainer}>{children}</View>

      {/* ── Footer / Continue Button ── */}
      {showFooter && (
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              isContinueDisabled && styles.continueBtnDisabled,
            ]}
            onPress={() => {
              if (isContinueDisabled) return;
              onContinue?.();
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.continueBtnText, { color: colors.white }]}>{continueText}</Text>
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
    lineHeight: 30,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
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
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
