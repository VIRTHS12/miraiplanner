import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useColorScheme } from "@/hooks/use-color-scheme";


// 🔥 FIX UTAMA ERROR 1: Inject font MaterialCommunityIcons lewat CDN untuk platform Web
if (Platform.OS === "web" && typeof document !== "undefined") {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css";
  document.head.appendChild(link);
}
export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          ...MaterialCommunityIcons.font,
        }
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Mirai Planner";

      // CDN ICON FIX
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css";
      document.head.appendChild(link);

      const style = document.createElement("style");
      style.innerHTML = `
        [style*="material-community"] {
          font-family: "Material Design Icons" !important;
        }
      `;
      document.head.appendChild(style);

      // CLEAN URL
      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        url.searchParams.delete("user");

        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="chatscreen" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
