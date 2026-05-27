
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';


const { width: SW } = Dimensions.get('window');

// ─── Design Tokens (match PDF) ─────────────────────────────────────────────
const C = {
  primary:   '#1A3F8B',
  white:     '#FFFFFF',
  grey:      '#6B7280',
  text:      '#0D1B2A',
  border:    '#0D1B2A',   // unselected chip border — matches PDF (dark border)
  navBg:     '#1A3F8B',
  trackBg:   '#D1D5DB',
};

// ─── Add / remove symptoms here freely ───────────────────────────────────────
const ALL_SYMPTOMS = [
  'ABDOMINAL BLOATING',
  'ABDOMINAL PAIN',
  'ABNORMAL MENSTRUATION',
  'ACIDITY',
  'ANAL BURNING',
  'ANAL PAIN',
  'ANOREXIA',
  'ANXIETY',
  'BACK PAIN',
  'BLADDER INSUFFICIENCY',
  'BLEEDING FROM THE NAVEL',
  'BLISTERS',
  'BLISTERS ON THE LIPS',
  'BLOATING',
  'BLOOD CLOT',
  'BLOODY DIARRHEA',
  'BLOODY STOOL',
  'BLURRED VISION',
  'BODY ACHE',
  'BODY GETTING COLD',
  'BODY PAIN',
  'BONES OF THE LEGS CURVED LIKE BOW',
  'BREAST ENLARGEMENT',
  'BRITTLE BONES',
  'BRITTLE GUMS',
  'BURNING EYES',
  'BURNING SENSATION',
  'BURNING URINATION',
  'CHEST PAIN',
  'CHEST PAIN WITH PRESSURE',
  'CHILLS',
  'CLAY COLORED STOOL',
  'COGNITIVE DECLINE',
  'COLD',
  'COLOR FADING APPEARANCE',
  'COMA',
  'CONSTIPATION',
  'CONTINUOUS SNEEZING',
  'CORNEAL DAMAGE',
  'COUGH',
  'COUGHING BLOOD',
  'COUGHING WITH MUCUS',
  'CRIPPLED',
  'DARK COLORED URINE',
  'DARK GUMS',
  'DEHYDRATION',
  'DEJA VU',
  'DIARRHEA',
  'DIFFICULTY IN DEFECATION',
  'DIFFICULTY SWALLOWING',
  'DISLIKE OF FOOD',
  'DIZZINESS',
  'DOUBLE VISION',
  'DRY SKIN',
  'EAR FLUID DRAINAGE',
  'EAR PAIN',
  'ENLARGED LIVER',
  'EXCESSIVE BLEEDING',
  'EXCESSIVE HUNGER',
  'EXCESSIVE SALIVATION',
  'EYE DISCOMFORT',
  'EYE PAIN',
  'EYE PROBLEMS',
  'EYE REDNESS',
  'FACIAL DROOP',
  'FAINTING',
  'FAMILY HISTORY',
  'FATIGUE',
  'FEAR OF THE WIND',
  'FEEL COLD',
  'FEVER',
  'FREQUENT URINATION',
  'GENITAL PAIN',
  'GINGIVITIS',
  'GUM ABSCESS',
  'GUMS SWELL',
  'HARD MUSCLE',
  'HEAD SCRATCHING',
  'HEADACHE',
  'HEARING DIFFICULTY',
  'HEARING LOSS',
  'HEARTBURN',
  'HEAVINESS',
  'HIGH FEVER',
  'HOLE IN THE GUM',
  'HYPERTENSION',
  'INABILITY TO FOCUS',
  'INABILITY TO WALK',
  'INDIGESTION',
  'INSOMNIA',
  'ITCHING',
  'JOINT PAIN',
  'LOOSE TOOTH',
  'LOSS OF APPETITE',
  'LOSS OF BALANCE',
  'LOSS OF CONSCIOUSNESS',
  'LOSS OF SENSE OF SMELL AND TASTE',
  'MEMORY LOSS',
  'MENTAL ANXIETY',
  'MOOD SWINGS',
  'MUCUS IN THE THROAT',
  'MUSCLE PAIN',
  'MUSCLE WEAKNESS',
  'NASAL INFLAMMATION',
  'NAUSEA',
  'NECK PAIN',
  'NECK SWELLING',
  'NUMBNESS',
  'OPEN WOUND',
  'PAIN BEHIND EYES',
  'PAIN IN HANDS AND FEET',
  'PAINFUL DEFECATION',
  'PALE SPOTS ON SKIN',
  'PARALYSED BODY',
  'PARALYSIS',
  'PHLEGM',
  'POOR NIGHT VISION',
  'PRICKLY HEAT RASH',
  'PULSE RATE DECREASE',
  'PUS FILLED PIMPLE',
  'PUS FROM THE GUMS',
  'RAPID BREATHING',
  'RAPID PULSE',
  'RASH',
  'RASHES',
  'RED EYES',
  'RUNNY NOSE',
  'SEIZURES',
  'SENSITIVITY TO LIGHT',
  'SHORTNESS OF BREATH',
  'SLEEP ISSUES',
  'SLURRED SPEECH',
  'SMALL BOILS ON THE SKIN',
  'SMALL NAIL PITS',
  'SOFT TONGUE',
  'SORE',
  'SORE THROAT',
  'SORE TONGUE',
  'SPEECH DIFFICULTY',
  'STICKY EYELIDS',
  'STIFF NECK',
  'STRONG HANDS AND FEET',
  'SUDDEN UNCONTROLLED ELECTRICAL DISTURBANCES IN THE BRAIN',
  'SWEATING',
  'SWELLING OF THE JOINTS',
  'SWOLLEN',
  'SWOLLEN ANKLES',
  'SWOLLEN EYELIDS',
  'SWOLLEN TONGUE',
  'TALKING NONSENSE',
  'TEMPORARY DISTRACTION',
  'THROBBING AROUND THE LIPS',
  'TINGLING IN HANDS AND FEET',
  'TONGUE ULCER',
  'TOOTH BRITTLE',
  'VAGINAL DISCHARGE',
  'VOMITING',
  'VOMITING BLOOD',
  'WATERY EYES',
  'WEAK JOINTS',
  'WEAKNESS',
  'WEIGHT GAIN',
  'WEIGHT LOSS',
  'WHITE SPOTS ON MOUTH',
  'YELLOW EYES',
  'YELLOW SKIN'
];

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepBar({ step = 1, total = 3 }: { step?: number; total?: number }) {
  const pct = (step / total) * 100;
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepLabel}>Step {step} of {total}</Text>
      <View style={styles.stepTrack}>
        <View style={[styles.stepFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

// ─── Bottom Nav Bar ────────────────────────────────────────────────────────────
function BottomNav({ onNavigate }: { onNavigate?: (key: string) => void }) {
  // Unicode stand-ins; swap for react-native-vector-icons if preferred
  const tabs = [
    { key: 'profile',     icon: '🪪' },
    { key: 'calendar',    icon: '📅' },
    { key: 'add',         icon: '📋',  center: true },
    { key: 'navigation',  icon: '➤' },
    { key: 'settings',    icon: '⚙️' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) =>
        tab.center ? (
          <View key={tab.key} style={styles.navItemCenter}>
            <TouchableOpacity
              style={styles.navCenterBtn}
              onPress={() => onNavigate?.(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.navCenterIcon}>📋</Text>
              {/* small "+" badge */}
              <View style={styles.navPlusBadge}>
                <Text style={styles.navPlusText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => onNavigate?.(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SymptomSelectScreen({ onContinue, onNavigate }: { onContinue?: (selected: string[]) => void; onNavigate?: (key: string) => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const handleBottomNav = (key: string) => {
    if (key === 'calendar') {
      router.push('/pill_sched');
      return;
    }
    onNavigate?.(key);
  };

  const toggle = (symptom: string): void => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

    
      {/* ── Fixed: step bar + question text ── */}
      <View style={styles.topSection}>
        <StepBar step={1} total={3} />

        <Text style={styles.question}>WHAT ARE YOU{'\n'}FEELING TODAY?</Text>
        <Text style={styles.instruction}>Select all symptoms that applies to you.</Text>
      </View>



      {/* ── Scrollable symptom chips ── */}
      <ScrollView

        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {ALL_SYMPTOMS.map((symptom) => {
          const isSelected = selected.includes(symptom);
          return (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => toggle(symptom)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {symptom}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Fixed: Continue button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selected.length === 0 && styles.continueBtnDisabled,
          ]}
          onPress={() => selected.length > 0 && onContinue?.(selected)}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue  →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom nav bar ── */}
      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: C.white,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
  },
  brandText: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  brandMe: {
    color: C.primary,
    fontWeight: '900',
  },
  brandDetect: {
    color: C.grey,
    fontWeight: '400',
  },

  // ── Step bar + question (fixed, not scrollable) ──────────────────────────────
  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },

  // ── Step bar ─────────────────────────────────────────────────────────────────
  stepWrap: {
    marginBottom: 22,
  },
  stepLabel: {
    fontSize: 12,
    color: C.grey,
    marginBottom: 6,
  },
  stepTrack: {
    height: 5,
    backgroundColor: C.trackBg,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 10,
  },

  // ── Question text ─────────────────────────────────────────────────────────────
  question: {
    fontSize: 24,
    fontWeight: '900',
    color: C.text,
    lineHeight: 30,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: C.text,
    lineHeight: 18,
  },

  // ── Scrollable chip area ──────────────────────────────────────────────────────
  chipScroll: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: 18,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },

  // ── Chips ─────────────────────────────────────────────────────────────────────
  chip: {
    borderRadius: 50,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  chipSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  chipUnselected: {
    backgroundColor: C.white,
    borderColor: C.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chipTextSelected: {
    color: C.white,
  },
  chipTextUnselected: {
    color: C.text,
  },

  // ── Footer: Continue button ───────────────────────────────────────────────────
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
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
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Bottom Nav Bar ────────────────────────────────────────────────────────────
  navBar: {
    height: 70,
    backgroundColor: C.navBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navIcon: {
    fontSize: 20,
    color: C.white,
  },

  // Center "add" button rises above nav bar
  navItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
  },
  navCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.white,
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
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPlusText: {
    fontSize: 11,
    color: C.white,
    fontWeight: '900',
    lineHeight: 14,
  },
});