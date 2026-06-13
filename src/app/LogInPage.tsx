import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import sharedStyles from "../constants/sharedStyles";

export default function LoginScreen() {
  const router = useRouter();
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
    router.push("/page1");
  }
  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={sharedStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={sharedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={sharedStyles.headerTitle}>LOGIN</Text>

          <View style={sharedStyles.formContainer}>
            <Text style={sharedStyles.label}>E-mail:</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="sample@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={sharedStyles.label}>Password</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder=".........."
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={sharedStyles.bottomContainer}>
            <TouchableOpacity
              style={sharedStyles.button}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={sharedStyles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <View style={sharedStyles.footerRow}>
              <Text style={sharedStyles.footerText}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/SignUpPage")}>
                <Text style={sharedStyles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
