import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import StepBar from '../components/StepBar';
import Colors from '../constants/colors';

const { width: SW } = Dimensions.get('window');

const ALL_SYMPTOMS = [
  'ABDOMINAL BLOATING', 'ABDOMINAL PAIN', 'ABNORMAL MENSTRUATION', 'ACIDITY',
  'ANAL BURNING', 'ANAL PAIN', 'ANOREXIA', 'ANXIETY', 'BACK PAIN',
  'BLADDER INSUFFICIENCY', 'BLEEDING FROM THE NAVEL', 'BLISTERS',
  'BLISTERS ON THE LIPS', 'BLOATING', 'BLOOD CLOT', 'BLOODY DIARRHEA',
  'BLOODY STOOL', 'BLURRED VISION', 'BODY ACHE', 'BODY GETTING COLD',
  'BODY PAIN', 'BONES OF THE LEGS CURVED LIKE BOW', 'BREAST ENLARGEMENT',
  'BRITTLE BONES', 'BRITTLE GUMS', 'BURNING EYES', 'BURNING SENSATION',
  'BURNING URINATION', 'CHEST PAIN', 'CHEST PAIN WITH PRESSURE', 'CHILLS',
  'CLAY COLORED STOOL', 'COGNITIVE DECLINE', 'COLD', 'COLOR FADING APPEARANCE',
  'COMA', 'CONSTIPATION', 'CONTINUOUS SNEEZING', 'CORNEAL DAMAGE', 'COUGH',
  'COUGHING BLOOD', 'COUGHING WITH MUCUS', 'CRIPPLED', 'DARK COLORED URINE',
  'DARK GUMS', 'DEHYDRATION', 'DEJA VU', 'DIARRHEA', 'DIFFICULTY IN DEFECATION',
  'DIFFICULTY SWALLOWING', 'DISLIKE OF FOOD', 'DIZZINESS', 'DOUBLE VISION',
  'DRY SKIN', 'EAR FLUID DRAINAGE', 'EAR PAIN', 'ENLARGED LIVER',
  'EXCESSIVE BLEEDING', 'EXCESSIVE HUNGER', 'EXCESSIVE SALIVATION',
  'EYE DISCOMFORT', 'EYE PAIN', 'EYE PROBLEMS', 'EYE REDNESS', 'FACIAL DROOP',
  'FAINTING', 'FAMILY HISTORY', 'FATIGUE', 'FEAR OF THE WIND', 'FEEL COLD',
  'FEVER', 'FREQUENT URINATION', 'GENITAL PAIN', 'GINGIVITIS', 'GUM ABSCESS',
  'GUMS SWELL', 'HARD MUSCLE', 'HEAD SCRATCHING', 'HEADACHE',
  'HEARING DIFFICULTY', 'HEARING LOSS', 'HEARTBURN', 'HEAVINESS', 'HIGH FEVER',
  'HOLE IN THE GUM', 'HYPERTENSION', 'INABILITY TO FOCUS', 'INABILITY TO WALK',
  'INDIGESTION', 'INSOMNIA', 'ITCHING', 'JOINT PAIN', 'LOOSE TOOTH',
  'LOSS OF APPETITE', 'LOSS OF BALANCE', 'LOSS OF CONSCIOUSNESS',
  'LOSS OF SENSE OF SMELL AND TASTE', 'MEMORY LOSS', 'MENTAL ANXIETY',
  'MOOD SWINGS', 'MUCUS IN THE THROAT', 'MUSCLE PAIN', 'MUSCLE WEAKNESS',
  'NASAL INFLAMMATION', 'NAUSEA', 'NECK PAIN', 'NECK SWELLING', 'NUMBNESS',
  'OPEN WOUND', 'PAIN BEHIND EYES', 'PAIN IN HANDS AND FEET',
  'PAINFUL DEFECATION', 'PALE SPOTS ON SKIN', 'PARALYSED BODY', 'PARALYSIS',
  'PHLEGM', 'POOR NIGHT VISION', 'PRICKLY HEAT RASH', 'PULSE RATE DECREASE',
  'PUS FILLED PIMPLE', 'PUS FROM THE GUMS', 'RAPID BREATHING', 'RAPID PULSE',
  'RASH', 'RASHES', 'RED EYES', 'RUNNY NOSE', 'SEIZURES',
  'SENSITIVITY TO LIGHT', 'SHORTNESS OF BREATH', 'SLEEP ISSUES',
  'SLURRED SPEECH', 'SMALL BOILS ON THE SKIN', 'SMALL NAIL PITS', 'SOFT TONGUE',
  'SORE', 'SORE THROAT', 'SORE TONGUE', 'SPEECH DIFFICULTY', 'STICKY EYELIDS',
  'STIFF NECK', 'STRONG HANDS AND FEET',
  'SUDDEN UNCONTROLLED ELECTRICAL DISTURBANCES IN THE BRAIN', 'SWEATING',
  'SWELLING OF THE JOINTS', 'SWOLLEN', 'SWOLLEN ANKLES', 'SWOLLEN EYELIDS',
  'SWOLLEN TONGUE', 'TALKING NONSENSE', 'TEMPORARY DISTRACTION',
  'THROBBING AROUND THE LIPS', 'TINGLING IN HANDS AND FEET', 'TONGUE ULCER',
  'TOOTH BRITTLE', 'VAGINAL DISCHARGE', 'VOMITING', 'VOMITING BLOOD',
  'WATERY EYES', 'WEAK JOINTS', 'WEAKNESS', 'WEIGHT GAIN', 'WEIGHT LOSS',
  'WHITE SPOTS ON MOUTH', 'YELLOW EYES', 'YELLOW SKIN',
];

export default function SymptomSelectScreen({
  onContinue,
  onNavigate,
}: {
  onContinue?: (selected: string[]) => void;
  onNavigate?: (key: string) => void;
}) {
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
        : [...prev, symptom],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topSection}>
        <StepBar step={1} total={3} />
        <Text style={styles.question}>WHAT ARE YOU{'\n'}FEELING TODAY?</Text>
        <Text style={styles.instruction}>Select all symptoms that applies to you.</Text>
      </View>

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
              style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
          onPress={() => {
            if (selected.length === 0) return;
            onContinue?.(selected);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  topSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },

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
  chip: {
    borderRadius: 50,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipUnselected: { backgroundColor: Colors.white, borderColor: Colors.text },
  chipText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.text },

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
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
