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

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (Platform.OS === "web") {
            // 1. Kunci judul tab browser secara global
            document.title = "Mirai Planner";

            // 2. Bersihkan URL dari token secara permanen jika ada
            const url = new URL(window.location.href);
            if (url.searchParams.has("token")) {
                url.searchParams.delete("token");
                url.searchParams.delete("user"); // Hapus param user juga jika ada

                // Ganti URL di browser tanpa reload halaman
                window.history.replaceState(
                    {},
                    document.title,
                    url.pathname + url.search,
                );
            }
        }
    }, []);

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                {/* Menyembunyikan header bawaan secara global & spesifik */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                
                {/* 🔥 FIX UTAMA: Daftarkan rute login & chatscreen agar tidak memunculkan bar hitam */}
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
