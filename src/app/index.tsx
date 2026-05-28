import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";

const { width: SW } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/images/medetect_logo.png")}
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
          <Text style={styles.headline}>Know Your{"\n"}Symptoms</Text>
          <Text style={styles.desc}>
            Fast, reliable symptom analysis{"\n"}to help you make informed{"\n"}
            health decisions.
          </Text>
        </View>
      </View>

      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/page1")}
          activeOpacity={0.85}
        >
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.startBtnText}>Start Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/LogInPage")}
          activeOpacity={0.85}
        >
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.startBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  logoWrap: { marginBottom: 4 },
  logoImage: { width: 180, height: 180 },

  brandText: { fontSize: 38, letterSpacing: 1 },
  brandMe: { color: Colors.primary, fontWeight: "900" },
  brandDetect: { color: Colors.grey, fontWeight: "900" },

  taglineBlock: { alignItems: "center" },
  companyName: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: Colors.grey,
    marginBottom: 10,
    textAlign: "center",
  },
  headline: {
    fontSize: 34,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
  },
  desc: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 21,
  },

  btnWrap: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === "ios" ? 24 : 32,
    gap: 12,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    width: SW - 64,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    gap: 8,
  },
  playIcon: { fontSize: 25, color: Colors.white },
  startBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
