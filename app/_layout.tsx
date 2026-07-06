import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // 1. Set client siap hanya ketika sudah benar-benar masuk browser
    setClientReady(true);

    if (Platform.OS === "web") {
      document.title = "Mirai Planner";

      // 2. Inject CSS Font secara dinamis langsung ke Head Browser khusus Web
      // Cara ini akan mendepak dan menimpa (override) pencarian font lokal Expo ke node_modules
      const fontName = "material-community";
      if (!document.getElementById(fontName)) {
        const style = document.createElement("style");
        style.id = fontName;
        style.textContent = `
          @font-face {
            font-family: 'material-community';
            src: url('/assets/fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'feather';
            src: url('/assets/fonts/Feather.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'FontAwesome';
            src: url('/assets/fonts/FontAwesome.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'FontAwesome6_Solid';
            src: url('/assets/fonts/FontAwesome6_Solid.ttf') format('truetype');
            font-weight: 900;
            font-style: normal;
          }
          @font-face {
            font-family: 'FontAwesome6_Regular';
            src: url('/assets/fonts/FontAwesome6_Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'ionicons';
            src: url('/assets/fonts/Ionicons.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
      }

      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, []);

  // 3. Hydration Guard: Jangan render pohon komponen apapun sebelum client siap murni di browser
  // Obat paling mujarab untuk mematikan Minified React error #418 selamanya!
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
