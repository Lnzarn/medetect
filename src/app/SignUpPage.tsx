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
export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSignUp() {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please enter the necessary details.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }
    router.push("/AccountPage");
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
          <Text style={sharedStyles.headerTitle}>SIGN UP</Text>

          <View style={sharedStyles.formContainer}>
            <Text style={sharedStyles.label}>Full Name</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="Juan Dela Cruz"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Text style={sharedStyles.label}>E-mail</Text>
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

            <Text style={sharedStyles.label}>Confirm Password</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder=".........."
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={sharedStyles.bottomContainer}>
            <TouchableOpacity
              style={sharedStyles.button}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={sharedStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={sharedStyles.footerRow}>
              <Text style={sharedStyles.footerText}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/LogInPage")}>
                <Text style={sharedStyles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
