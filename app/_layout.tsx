import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState } from "react"; // Tambahkan useState di sini
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [clientReady, setClientReady] = useState(false); // 1. Buat state penahan

  useEffect(() => {
    setClientReady(true); // 2. Set jadi true begitu masuk browser (client-side)

    if (Platform.OS === "web") {
      document.title = "Mirai Planner";

      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, []);

  // 3. JANGAN render komponen apapun sampai client bener-bener siap
  // Ini obat paling mujarab biar Error #418 (Hydration Mismatch) musnah total!
  if (!clientReady) {
    return null; 
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="chatscreen" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
