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
    // Pastikan kode ini HANYA dieksekusi di browser murni (client-side)
    setClientReady(true);

    if (Platform.OS === "web") {
      document.title = "Mirai Planner";

      // Suntik font langsung ke head agar dibaca secara native oleh web mobile maupun desktop
      const fontName = "mirai-fonts-setup";
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
            font-family: 'MaterialCommunityIcons';
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
            font-family: 'font-awesome';
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

      // Bersihkan URL token
      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, []);

  // JANGAN render kerangka UI apapun jika client belum siap murni di browser.
  // Ini tameng mutlak biar mobile emulation gak ngetrigger perbedaan DOM pas proses hidrasi.
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
