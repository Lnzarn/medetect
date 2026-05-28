import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import sharedStyles from "../constants/sharedStyles";

export default function AccountScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const handleSave = () => {
    console.log("Saving account info:", { username });
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={sharedStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={sharedStyles.headerTitle}>ACCOUNT</Text>

          <View style={sharedStyles.formContainer}>
            <Text style={sharedStyles.label}>Username</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="furryfemboy123"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={sharedStyles.bottomContainer}>
            <TouchableOpacity
              style={sharedStyles.button}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={sharedStyles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Only page-specific overrides live here
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80, // slightly different from auth pages
    paddingBottom: 80,
  },
});
