import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* landing_page should be the first screen */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />

      {/* page1 is Step 1 after tapping Continue */}
      <Stack.Screen
        name="page1"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />

      {/* pill_sched is medication schedule page */}
      <Stack.Screen
        name="pill_sched"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

