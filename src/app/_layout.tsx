import Loading from "@/components/Loading";
import { AuthProvider, useAuth } from "@/lib/auth";
import { syncDiseaseData } from "@/lib/sync";
import { ThemeProvider } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

function RootStack() {
  const { mode, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Loading message="Please wait..." />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="LogInPage"
        options={{
          headerShown: false,
          animation: "none",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SignUpPage"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="page1"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="pill_sched"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="results"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AccountPage"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Settings"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="DiseaseDirectory"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="DiseaseDetail"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="page2"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AssessmentHistory"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const syncing = useRef(false);

  useEffect(() => {
    if (syncing.current) return;
    syncing.current = true;
    syncDiseaseData()
      .catch(console.error)
      .finally(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Loading message="Setting up database..." />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
