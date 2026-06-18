import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useAppColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSharedStyles from "../constants/sharedStyles";

const { width: SW } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const styles = useSharedStyles();
  const colors = useAppColors();
  const { setGuest } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }
    // Replace so the back button cannot return to LogInPage
    router.replace("/page1");
  }

  function handleGuest() {
    setGuest();
    // Replace so the back button cannot return to LogInPage
    router.replace("/page1");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>LOGIN</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput
              style={styles.input}
              placeholder="sample@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.bottomContainer}>
            {/* Primary: Log In */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Guest entry */}
            <TouchableOpacity
              style={[localStyles.guestBtn, { borderColor: colors.primary }]}
              onPress={handleGuest}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text
                style={[localStyles.guestBtnText, { color: colors.primary }]}
              >
                Continue as Guest
              </Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Do not have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/SignUpPage")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  guestBtn: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  guestBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
