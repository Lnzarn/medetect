
import React from 'react';


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';




const { width: SW } = Dimensions.get('window');

const C = {
  primary: '#1A3F8B',
  primaryLight: '#2C5FD4',
  lightBlue: '#D9E8F5',
  white: '#FFFFFF',
  grey: '#6B7280',
  text: '#0D1B2A',
};

import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>

      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.container}>

    
        <View style={styles.logoWrap}>
          <Image
            source={require('./medetect_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>



        
        <View>
          <Text style={styles.brandText}>
            <Text style={styles.brandMe}>me</Text>
            <Text style={styles.brandDetect}>detect</Text>
          </Text>
        </View>

        <View style={styles.taglineBlock}>
          <Text style={styles.companyName}>MEDETECH HEALTH</Text>

          <Text style={styles.headline}>Know Your{'\n'}Symptoms</Text>
          <Text style={styles.desc}>
            Fast, reliable symptom analysis{'\n'}to help you make informed{'\n'}health decisions.
          </Text>
        </View>

      </View>

    
      <View style={styles.btnWrap}>

        <TouchableOpacity

          style={styles.startBtn}
          onPress={() => router.push('/page1')}
          activeOpacity={0.85}

        >

          
          <View>
            <Text style={styles.playIcon}>▶</Text>
          </View>

          <Text style={styles.startBtnText}>Start Session</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.white,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },

  // Logo
  logoWrap: {
    marginBottom: 4,
  },
  logoImage: {
    width: 180,
    height: 180,
  },

 
  ecgRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  ecgLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  ecgPeak: {
    width: 2,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
    marginHorizontal: 2,
  },
  // Plus / cross
  crossV: {
    position: 'absolute',
    width: 4,
    height: 36,
    backgroundColor: C.white,
    borderRadius: 2,
  },
  crossH: {
    position: 'absolute',
    width: 36,
    height: 4,
    backgroundColor: C.white,
    borderRadius: 2,
  },
  // Magnifier handle
  magnifierHandle: {
    position: 'absolute',
    bottom: 14,
    right: 10,
    width: 14,
    height: 24,
    backgroundColor: C.primaryLight,
    borderRadius: 7,
    transform: [{ rotate: '40deg' }],
  },

  // Brand name
  brandText: {
    fontSize: 38,
    letterSpacing: 1,
  },
  brandMe: {
    color: C.primary,
    fontWeight: '900',
  },
  brandDetect: {
    color: C.grey,
    fontWeight: '900',
  },


  // Tagline
  taglineBlock: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: C.grey,
    marginBottom: 10,
    textAlign: 'center',
  },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 14,
  },
  desc: {
    fontSize: 14,
    color: C.grey,
    textAlign: 'center',
    lineHeight: 21,
  },

  // Button
  btnWrap: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    width: SW - 64,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  
  playIcon: {
    fontSize: 25,
    color: C.white,
    marginLeft: 5,
  },
  startBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
