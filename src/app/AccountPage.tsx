import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { useAppColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function AccountScreen() {
  const styles = useSharedStyles();
  const localStyles = useLocalStyles();
  const colors = useAppColors();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);
      getProfile(user.id);
    }
    loadUser();
  }, []);

  async function getProfile(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) setUsername(data.username ?? "");
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const updates = { id: userId, username, updated_at: new Date() };
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      Alert.alert("Profile updated!");
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
      router.replace("/page1");
    }
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
          <Text style={styles.headerTitle}>ACCOUNT</Text>

          <TouchableOpacity
            style={[
              localStyles.historyRow,
              { borderColor: colors.border, backgroundColor: colors.elementBg },
            ]}
            onPress={() => router.push("/AssessmentHistory")}
            activeOpacity={0.75}
          >
            <Text style={localStyles.historyIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={[localStyles.historyTitle, { color: colors.text }]}>
                Assessment History
              </Text>
              <Text
                style={[localStyles.historyDesc, { color: colors.textMuted }]}
              >
                View your past symptom assessments
              </Text>
            </View>
            <Text
              style={[localStyles.historyArrow, { color: colors.textMuted }]}
            >
              →
            </Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="username123"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={updateProfile}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav />
    </SafeAreaView>
  );
}

function useLocalStyles() {
  const colors = useAppColors();
  return StyleSheet.create({
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 14,
      padding: 14,
      marginBottom: 24,
      gap: 12,
    },
    historyIcon: { fontSize: 22 },
    historyTitle: { fontSize: 15, fontWeight: "700" },
    historyDesc: { fontSize: 12, marginTop: 2 },
    historyArrow: { fontSize: 18, fontWeight: "700" },
  });
}
