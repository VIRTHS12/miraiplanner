import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
    const PINK_PRIMARY = "#E87A90";
    const TEXT_LIGHT = "#888888";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            // 🔥 KUNCI UTAMA: Inject Navbar Custom lu di sini
            tabBar={({ state, navigation }) => {
                // Ambil nama rute yang aktif saat ini
                const activeRoute = state.routes[state.index].name;

                const handleNavigate = (routeName: string) => {
                    navigation.navigate(routeName);
                };

                return (
                    <View style={styles.bottomNavContainer}>
                        <View style={styles.bottomNav}>
                            {/* Tombol Beranda */}
                            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate("index")}>
                                <MaterialCommunityIcons
                                    name="home-variant"
                                    size={28}
                                    color={activeRoute === "index" ? PINK_PRIMARY : TEXT_LIGHT}
                                />
                                <Text style={[styles.navText, activeRoute === "index" && { color: PINK_PRIMARY }]}>
                                    Beranda
                                </Text>
                            </TouchableOpacity>

                            {/* Tombol Kalender */}
                            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate("calendar")}>
                                <Feather 
                                    name="calendar" 
                                    size={24} 
                                    color={activeRoute === "calendar" ? PINK_PRIMARY : TEXT_LIGHT} 
                                />
                                <Text style={[styles.navText, activeRoute === "calendar" && { color: PINK_PRIMARY }]}>
                                    Kalender
                                </Text>
                            </TouchableOpacity>

                            {/* Tombol Chat (Pindah ke screen di luar tab group agar fullscreen) */}
                            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("chatscreen")}>
                                <Feather name="message-circle" size={24} color={TEXT_LIGHT} />
                                <Text style={styles.navText}>Chat</Text>
                            </TouchableOpacity>

                            {/* Tombol Profil */}
                            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigate("profile")}>
                                <Feather 
                                    name="user" 
                                    size={24} 
                                    color={activeRoute === "profile" ? PINK_PRIMARY : TEXT_LIGHT} 
                                />
                                <Text style={[styles.navText, activeRoute === "profile" && { color: PINK_PRIMARY }]}>
                                    Profil
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }}
        >
            {/* Definisikan daftar tab yang tersedia */}
            <Tabs.Screen name="index" options={{ title: "Beranda" }} />
            <Tabs.Screen name="calendar" options={{ title: "Kalender" }} />
            <Tabs.Screen name="profile" options={{ title: "Profil" }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    bottomNavContainer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        width: "100%",
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
    navText: { fontSize: 10, marginTop: 4, color: "#888" },
});
