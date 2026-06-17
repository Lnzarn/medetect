import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
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

type Category =
  | 'Skin'
  | 'Respiratory'
  | 'Eyes'
  | 'Digestive'
  | 'Pain & Mobility'
  | 'Fever & Flu'
  | 'Urinary'
  | 'Not sure / General';

const CATEGORIES: Category[] = [
  'Skin',
  'Respiratory',
  'Eyes',
  'Digestive',
  'Pain & Mobility',
  'Fever & Flu',
  'Urinary',
  'Not sure / General',
];

export default function SymptomSelectScreen({
  onNavigate,
}: {
  onNavigate?: (key: string) => void;
}) {
  const router = useRouter();

  const handleBottomNav = (key: string) => {
    if (key === 'calendar') {
      router.push('/pill_sched');
      return;
    }
    onNavigate?.(key);
  };

  const handleSelectCategory = (cat: Category) => {
    router.push({
      pathname: '/page2',
      params: { category: cat },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} translucent={false} />

      {}
      <View style={styles.topSection}>
        {}
        <View style={styles.stepBarContainer}>
          <StepBar step={1} total={3} />
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backRow} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.question}>WHERE ARE YOU PRIMARILY{'\n'}EXPERIENCING YOUR SYMPTOMS?</Text>
        <Text style={styles.instruction}>Select the area that best matches what you're feeling.</Text>
      </View>

      
      <ScrollView
        style={styles.optionScroll}
        contentContainerStyle={styles.optionContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={styles.optionRow}
            onPress={() => handleSelectCategory(cat)}
            activeOpacity={0.75}
          >
            <Text style={styles.optionRowText}>{cat}</Text>
            <Text style={styles.optionRowArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: Colors.white,
   
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topSection: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 8,
  },
  stepBarContainer: {
    width: '100%',
    minHeight: 30, 
    marginBottom: 10,
    justifyContent: 'center',
  },
  backRow: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  question: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 30,
    marginTop: 10,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },

  optionScroll: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: 10,
  },
  optionContainer: {
    flexGrow: 1,
    paddingBottom: 24, 
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.text,
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
  },
  optionRowText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: Colors.text,
  },
  optionRowArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
});