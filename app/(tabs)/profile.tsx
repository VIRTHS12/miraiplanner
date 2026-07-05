import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME = {
    primary: "#E87A90",
    bg: "#FEF6F8",
    surface: "rgba(255, 255, 255, 0.90)",
    textDark: "#333333",
    textGray: "#666666",
    textLight: "#888888",
    border: "#FCE4E8",
};

export default function ProfileScreen() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 🧠 SYNC DATA PROFILE SECARA REAL-TIME DARI STORAGE
    useFocusEffect(
        useCallback(() => {
            const loadProfileData = async () => {
                try {
                    setLoading(true);
                    let storedUser = null;

                    if (Platform.OS === "web") {
                        storedUser = localStorage.getItem("user_data");
                    } else {
                        storedUser = await AsyncStorage.getItem("user_data");
                    }

                    if (storedUser) {
                        setUserData(JSON.parse(storedUser));
                    } else {
                        setUserData({
                            name: "Raihan Rizqullah",
                            email: "rahan@example.com",
                        });
                    }
                } catch (err) {
                    console.error("Gagal load data profil:", err);
                } finally {
                    setLoading(false);
                }
            };

            loadProfileData();
        }, []),
    );

    const handleLogout = async () => {
        setLoading(true);
        if (Platform.OS === "web") {
            localStorage.removeItem("user_token");
            localStorage.removeItem("user_data");
        } else {
            await AsyncStorage.removeItem("user_token");
            await AsyncStorage.removeItem("user_data");
        }
        router.replace("/login");
    };

    if (loading && !userData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    // Ambil inisial huruf buat avatar (misal: "Raihan Akbar" -> "R")
    const getInitial = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    return (
        <ImageBackground
            source={require("@/assets/images/fotobackground.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={[
                    "rgba(255, 255, 255, 0.85)",
                    "rgba(254, 238, 242, 0.60)",
                    "rgba(254, 228, 234, 0.85)",
                ]}
                locations={[0.0, 0.5, 0.9]}
                style={StyleSheet.absoluteFillObject}
            >
                <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <StatusBar
                            barStyle="dark-content"
                            backgroundColor="transparent"
                            translucent
                        />

                        {/* HEADER PANEL */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => router.back()}
                            >
                                <Feather name="chevron-left" size={24} color={THEME.textDark} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Profil Saya</Text>
                            <View style={{ width: 40 }} />{" "}
                            {/* Spacer penyeimbang back button */}
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* AVATAR & GREETING CARD */}
                            <View style={styles.profileCard}>
                                <View style={styles.avatarContainer}>
                                    <LinearGradient
                                        colors={["#FFB7CA", "#E87A90"]}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>
                                            {getInitial(userData?.name)}
                                        </Text>
                                    </LinearGradient>
                                    <View style={styles.googleBadge}>
                                        <MaterialCommunityIcons
                                            name="google"
                                            size={12}
                                            color="#FFF"
                                        />
                                    </View>
                                </View>
                                <Text style={styles.nameText}>
                                    {userData?.name || "Pengguna Mirai"}
                                </Text>
                                <Text style={styles.emailText}>
                                    {userData?.email || "Tidak ada email"}
                                </Text>
                            </View>

                            {/* ACCOUNT INFO SECTION */}
                            <Text style={styles.sectionTitle}>Informasi Akun</Text>
                            <View style={styles.infoBox}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoLeft}>
                                        <Feather
                                            name="user"
                                            size={18}
                                            color={THEME.primary}
                                            style={styles.rowIcon}
                                        />
                                        <Text style={styles.rowLabel}>Nama Lengkap</Text>
                                    </View>
                                    <Text style={styles.rowValue} numberOfLines={1}>
                                        {userData?.name || "-"}
                                    </Text>
                                </View>

                                <View style={styles.lineDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoLeft}>
                                        <Feather
                                            name="mail"
                                            size={18}
                                            color={THEME.primary}
                                            style={styles.rowIcon}
                                        />
                                        <Text style={styles.rowLabel}>Email</Text>
                                    </View>
                                    <Text style={styles.rowValue} numberOfLines={1}>
                                        {userData?.email || "-"}
                                    </Text>
                                </View>

                                <View style={styles.lineDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoLeft}>
                                        <Feather
                                            name="shield"
                                            size={18}
                                            color={THEME.primary}
                                            style={styles.rowIcon}
                                        />
                                        <Text style={styles.rowLabel}>Tipe Akun</Text>
                                    </View>
                                    <View style={styles.badgeActive}>
                                        <Text style={styles.badgeText}>Google Verified</Text>
                                    </View>
                                </View>
                            </View>

                            {/* PREFERENCES SECTION */}

                            {/* LOGOUT BUTTON */}
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                                activeOpacity={0.8}
                            >
                                <Feather
                                    name="log-out"
                                    size={20}
                                    color="#FFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
                            </TouchableOpacity>

                            {/* FOOTER APP VERSION */}
                            <Text style={styles.versionText}>Mirai Planner v1.0.0</Text>
                        </ScrollView>
                    </SafeAreaView>
                </BlurView>
            </LinearGradient>
        </ImageBackground>
    );
}

const shadowStyle = {
    shadowColor: "#E87A90",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
};

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%" },
    blurContainer: { flex: 1, backgroundColor: "transparent" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FEF2F4",
    },
    scrollContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        ...shadowStyle,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: THEME.textDark },
    profileCard: {
        backgroundColor: THEME.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        marginBottom: 28,
        ...shadowStyle,
    },
    avatarContainer: { position: "relative", marginBottom: 16 },
    avatarGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 32, fontWeight: "bold", color: "#FFF" },
    googleBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        backgroundColor: "#DB4437",
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    nameText: {
        fontSize: 20,
        fontWeight: "700",
        color: THEME.textDark,
        marginBottom: 4,
    },
    emailText: { fontSize: 13, color: THEME.textGray, fontWeight: "500" },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: THEME.textDark,
        marginLeft: 6,
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: THEME.surface,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
        ...shadowStyle,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    menuRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    infoLeft: { flexDirection: "row", alignItems: "center" },
    rowIcon: { marginRight: 12 },
    rowLabel: { fontSize: 14, color: THEME.textDark, fontWeight: "500" },
    rowValue: {
        fontSize: 14,
        color: THEME.textGray,
        fontWeight: "600",
        maxWidth: "55%",
    },
    lineDivider: { height: 1, backgroundColor: "#F0F0F0", width: "100%" },
    badgeActive: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: { fontSize: 11, color: "#2E7D32", fontWeight: "700" },
    logoutButton: {
        backgroundColor: "#E87A90",
        borderRadius: 16,
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        ...shadowStyle,
        shadowColor: "#E87A90",
        shadowOpacity: 0.2,
    },
    logoutButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    versionText: {
        fontSize: 12,
        color: THEME.textLight,
        textAlign: "center",
        marginTop: 24,
        fontWeight: "500",
    },
});
