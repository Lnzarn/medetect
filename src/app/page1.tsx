import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from './ScreenLayout';
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

  const handleNavClick = (key: string) => {
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
    <ScreenLayout
      step={1}
      totalSteps={3}
      title={'WHERE ARE YOU PRIMARILY\nEXPERIENCING YOUR SYMPTOMS?'}
      subtitle={"Select the area that best matches what you're feeling."}
      showFooter={false}
      onNavClick={handleNavClick}
    >
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
<<<<<<< Updated upstream

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
          onPress={() => {
            if (selected.length === 0) return;
            const encoded = encodeURIComponent(JSON.stringify(selected));
            router.push(`/results?selected=${encoded}`);
            onContinue?.(selected);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <BottomNav onNavigate={handleBottomNav} />
    </SafeAreaView>
=======
    </ScreenLayout>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
  optionScroll: {
    flex: 1,
    marginTop: 10,
  },
  optionContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
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

