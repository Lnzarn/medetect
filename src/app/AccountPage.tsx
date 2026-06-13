import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setUserId(user.id);
    getProfile(user.id);
  }

  async function getProfile(id: string) {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username ?? "");
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);

      const updates = {
        id: userId,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;
      Alert.alert("Profile update!");
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }
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
              placeholder="username123"
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
              onPress={updateProfile}
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

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80,
  },
});
