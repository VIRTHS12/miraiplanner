import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "expo-font";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [clientReady, setClientReady] = useState(false);

    const [loaded] = useFonts({
        ...Feather.font,
        ...MaterialCommunityIcons.font,
    });

    useEffect(() => {
        setClientReady(true);

        if (Platform.OS === "web") {
            document.title = "Mirai Planner";

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

    if (!clientReady || !loaded) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="chatscreen" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
