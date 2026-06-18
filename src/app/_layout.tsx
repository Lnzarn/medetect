import { syncDiseaseData } from "@/lib/sync";
import { ThemeProvider } from '@/lib/theme';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    syncDiseaseData()
      .catch(console.error)
      .finally(() => setDbReady(true));
  }, []);

  if (!dbReady) return null;
  return (
    <ThemeProvider>
      <Stack>
        {/* landing_page should be the first screen */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        {/* page1 is Step 1 after tapping Continue */}
        <Stack.Screen
          name="page1"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        {/* pill_sched is medication schedule page */}
        <Stack.Screen
          name="pill_sched"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        {/* results is Step 3 - assessment results */}
        <Stack.Screen
          name="results"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        {/* map page for finding nearby hospitals */}
        <Stack.Screen
          name="map"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        {/* Other screens */}
        <Stack.Screen
          name="LogInPage"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="SignUpPage"
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
      </Stack>
    </ThemeProvider>
  );
}
