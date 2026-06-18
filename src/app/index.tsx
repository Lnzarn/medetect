import { useAppColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useAppColors();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.text === "#FFFFFF" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

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
            <Text style={[styles.brandMe, { color: colors.primary }]}>me</Text>
            <Text style={[styles.brandDetect, { color: colors.text }]}>
              detect
            </Text>
          </Text>
        </View>

        <View style={styles.taglineBlock}>
          <Text style={[styles.companyName, { color: colors.text }]}>
            MEDETECH HEALTH
          </Text>
          <Text style={[styles.headline, { color: colors.text }]}>
            Know Your{"\n"}Symptoms
          </Text>
          <Text style={[styles.desc, { color: colors.text }]}>
            Fast, reliable symptom analysis{"\n"}to help you make informed{"\n"}
            health decisions.
          </Text>
        </View>
      </View>

      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={() => router.push("/LogInPage")}
          activeOpacity={0.85}
        >
          <Text style={[styles.playIcon, { color: colors.white }]}>▶</Text>
          <Text style={[styles.startBtnText, { color: colors.white }]}>
            Start
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

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
  brandMe: { fontWeight: "900" },
  brandDetect: { fontWeight: "900" },

  taglineBlock: { alignItems: "center" },
  companyName: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.5,
    marginBottom: 10,
    textAlign: "center",
  },
  headline: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
  },
  desc: {
    fontSize: 14,
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
    borderRadius: 16,
    paddingVertical: 18,
    width: SW - 64,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    gap: 8,
  },
  playIcon: { fontSize: 25 },
  startBtnText: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
