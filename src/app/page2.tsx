import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import ScreenLayout from './ScreenLayout';


const C = Colors;

export default function FollowUpScreen() {
  const router = useRouter();

  const [questionText] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pastAnswers] = useState<any[]>([]);

  const handleNavClick = (key: string) => {
    if (key === 'calendar') router.push('/pill_sched');
    if (key === 'add') router.push('/page1');
  };

  return (
    <ScreenLayout
      step={2}
      totalSteps={3}
      title="FOLLOW-UP"
      showFooter
      continueText="Continue  →"
      isContinueDisabled={!selectedAnswer}
      onContinue={() => {
        if (!selectedAnswer) return;
        router.push('/page2');
      }}
      onNavClick={handleNavClick}
    >
      <View style={styles.content}>
        <View style={styles.questionCard}>
          <View style={styles.questionTextWrapper}>
            <Text style={styles.questionEyebrow}>QUESTION #</Text>
            <Text style={styles.dynamicQuestionText}>Question Goes Here</Text>
          </View>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionBtn,
                styles.btnYes,
                selectedAnswer === 'Yes' ? styles.btnSelected : null,
              ]}
              onPress={() => setSelectedAnswer('Yes')}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionBtnText, styles.btnYesText]}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionBtn,
                styles.btnNo,
                selectedAnswer === 'No' ? styles.btnSelected : null,
              ]}
              onPress={() => setSelectedAnswer('No')}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionBtnText, styles.btnNoText]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 10,
    flex: 1,
  },
  questionCard: {
    minHeight: 350, 
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingTop: 35, 
    paddingBottom: 22, 
    backgroundColor: C.white,
    marginTop: 10,
    marginBottom: 5,
    justifyContent: 'space-between', 
  },
  questionTextWrapper: {},
  questionEyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 12,
  },
  dynamicQuestionText: {
    fontSize: 24,
    fontWeight: '900',
    color: C.text,
    marginBottom: 40, 
    lineHeight: 30,
  },
  
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, 
  },
  optionBtn: {
    flex: 1,
    maxWidth: 100, 
    paddingVertical: 10, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  btnYes: {
    backgroundColor: C.primary,
    borderColor: C.primary,
    borderWidth: 2,
  },
  btnYesText: {
    color: C.white,
  },
 
  btnNo: {
    backgroundColor: C.white,
    borderColor: C.greyLight,
    borderWidth: 2,
  },
  btnNoText: {
    color: C.text,
  },
  
  btnSelected: {
  borderColor: '#1F2937', 
  borderWidth: 2,        
  borderRadius: 8,        
},
  optionBtnText: {
    fontSize: 16, 
    fontWeight: '700',
  },
});