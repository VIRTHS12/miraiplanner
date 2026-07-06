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
            src: url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/fonts/materialdesignicons-webfont.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'feather';
            src: url('https://cdn.jsdelivr.net/npm/feather-font@1.0.0/src/fonts/feather.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'font-awesome';
            src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'FontAwesome6_Solid';
            src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.ttf') format('truetype');
            font-weight: 900;
            font-style: normal;
          }
          @font-face {
            font-family: 'FontAwesome6_Regular';
            src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-regular-400.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'ionicons';
            src: url('https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/ionicons/ionicons.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'anticon';
            src: url('https://cdn.jsdelivr.net/npm/ant-design-icons@2.0.0/fonts/AntDesign.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'material';
            src: url('https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/4.0.0/font/MaterialIcons-Regular.ttf') format('truetype');
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
