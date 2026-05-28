import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SW } = Dimensions.get('window');

export const COLORS = {
  primary: '#1A3F8B',
  white: '#FFFFFF',
  grey: '#6B7280',
  text: '#0D1B2A',
  border: '#0D1B2A',
  navBg: '#1A3F8B',
  trackBg: '#D1D5DB',
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────
export function StepBar({ step = 1, total = 3 }: { step?: number; total?: number }) {
  const pct = (step / total) * 100;
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepLabel}>
        Step {step} of {total}
      </Text>
      <View style={styles.stepTrack}>
        <View style={[styles.stepFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

// ─── Bottom Nav Bar ────────────────────────────────────────────────────────────
export function BottomNav({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { key: 'profile', icon: '🪪', route: '/profile' },
    { key: 'calendar', icon: '📅', route: '/pill_sched' },
    { key: 'add', icon: '📋', center: true, route: '/page1' },
    { key: 'navigation', icon: '➤', route: '/navigation' },
    { key: 'settings', icon: '⚙️', route: '/settings' },
  ];

  const handlePress = (tab: any) => {
    if (onNavigate) {
      onNavigate(tab.key);
    } else if (tab.route) {
      router.push(tab.route);
    }
  };

  return (
    <View style={[styles.navContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.navBar}>
        {tabs.map((tab) =>
          tab.center ? (
            <View key={tab.key} style={styles.navItemCenter}>
              <TouchableOpacity
                style={styles.navCenterBtn}
                onPress={() => handlePress(tab)}
                activeOpacity={0.8}
              >
                <Text style={styles.navCenterIcon}>📋</Text>
                <View style={styles.navPlusBadge}>
                  <Text style={styles.navPlusText}>+</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => handlePress(tab)}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

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
  continueText = 'Continue  →',
  onContinue,
  isContinueDisabled = false,
  onNavClick,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ── Header Area ── */}
      {(step || title || subtitle) && (
        <View style={styles.topSection}>
          {step && <StepBar step={step} total={totalSteps} />}
          {title && <Text style={styles.question}>{title}</Text>}
          {subtitle && <Text style={styles.instruction}>{subtitle}</Text>}
        </View>
      )}

      {/* ── Main Content Area (Inject Page Specific Content Here) ── */}
      <View style={styles.contentContainer}>
        {children}
      </View>

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
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  stepWrap: {
    marginBottom: 22,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 6,
  },
  stepTrack: {
    height: 5,
    backgroundColor: COLORS.trackBg,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 30,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  continueBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  navContainer: {
    backgroundColor: COLORS.navBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  navBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  navItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  navCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  navCenterIcon: {
    fontSize: 22,
  },
  navPlusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPlusText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '900',
    lineHeight: 14,
  },
});