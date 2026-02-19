import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 400,
        contentStyle: { backgroundColor: "#020617" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="landing"
        options={{
          animation: "slide_from_left",
          gestureDirection: "horizontal",
          gestureEnabled: true,
        }} />
      <Stack.Screen
        name="doctor-login"
        options={{
          animation: "fade_from_bottom",
          gestureDirection: "vertical",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
