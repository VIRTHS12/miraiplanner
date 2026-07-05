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

export const unstable_settings = {
    // 🔥 FIX UTAMA ERROR 2: Karena file index lu ada di dalam tabs, arahkan anchor langsung ke tabs
    initialRouteName: "(tabs)",
};

// 🔥 FIX UTAMA ERROR 1: Inject font MaterialCommunityIcons lewat CDN untuk platform Web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const iconFontStyles = `
    @font-face {
      src: url('https://cdnjs.cloudflare.com/ajax/libs/javascript-javascripticons/1.0.0/fonts/materialdesignicons-webfont.woff2') format('woff2');
      font-family: 'material-community';
    }
  `;

  const style = document.createElement('style');
  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }

  document.head.appendChild(style);
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    
    // Load font lokal (tetap jalan di mobile app)
    const [loaded] = useFonts({
        ...MaterialCommunityIcons.font,
    });

    // Pindahkan pengecekan loaded ke bawah useEffect / satukan dengan logic router agar tidak melompati siklus hook
    useEffect(() => {
        if (Platform.OS === "web") {
            // 1. Kunci judul tab browser secara global
            document.title = "Mirai Planner";

            // 2. Bersihkan URL dari token secara permanen jika ada
            const url = new URL(window.location.href);
            if (url.searchParams.has("token")) {
                url.searchParams.delete("token");
                url.searchParams.delete("user"); 

                window.history.replaceState(
                    {},
                    document.title,
                    url.pathname + url.search,
                );
            }
        }
    }, []);

    // Taruh conditional return di paling bawah setelah seluruh react hook dipanggil (mencegah error hook order)
    if (!loaded) return null;

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                {/* Menyembunyikan header bawaan secara global & spesifik */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                
                {/* 🔥 REVISI ERROR 2: Karena lu gak punya file index.tsx di root (adanya cuma chatscreen, login, modal, tabs), HAPUS rute index di bawah ini agar routing Expo tidak bingung mencari file hantu */}
                {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}

                {/* Daftarkan rute login & chatscreen agar tidak memunculkan bar hitam */}
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="chatscreen" options={{ headerShown: false }} />

                <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
