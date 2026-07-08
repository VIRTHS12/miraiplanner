import React, { useEffect, useState } from "react";
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
    useWindowDimensions,
    ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

export default function LandingScreen() {
    const PINK_PRIMARY = "#E87A90";
    const TEXT_DARK = "#2D2D2D";
    const TEXT_LIGHT = "#5A5A5A";

    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 768;

    const [isChecking, setIsChecking] = useState(true);

    // Fungsi pembantu untuk membuka link eksternal di Browser
    const openLegalLink = (anchor: string) => {
        const url = `https://virthas12.github.io/miraitospriv/${anchor}`;
        Linking.openURL(url).catch((err) =>
            console.error("Gagal membuka URL:", err),
        );
    };

    // Jalankan pengecekan session: Kalau user udah login, langsung lempar ke dashboard utama
    useEffect(() => {
        const checkExistingAuth = async () => {
            try {
                const token =
                    Platform.OS === "web"
                        ? localStorage.getItem("user_token")
                        : await AsyncStorage.getItem("user_token");

                if (token) {
                    // Disesuaikan dengan struktur folder kamu: app/(tabs)/home.tsx
                    router.replace("/(tabs)/home");
                }
            } catch (err) {
                console.error("Gagal memeriksa sesi login:", err);
            } finally {
                setIsChecking(false);
            }
        };
        checkExistingAuth();
    }, []);

    if (isChecking) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PINK_PRIMARY} />
            </View>
        );
    }

    return (
        <ImageBackground
            source={require("@/assets/images/fotobackground.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={[
                    "rgba(255,255,255,0.90)",
                    "rgba(254,238,242,0.70)",
                    "rgba(254,228,234,0.92)",
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            >
                <BlurView intensity={15} tint="light" style={styles.blurContainer}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <StatusBar
                            barStyle="dark-content"
                            backgroundColor="transparent"
                            translucent
                        />

                        <ScrollView
                            contentContainerStyle={[
                                styles.scrollContainer,
                                isLargeScreen && styles.scrollContainerWeb,
                            ]}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* TOP NAVBAR / BRAND HEADER */}
                            <View style={styles.navbar}>
                                <View style={styles.logoRow}>
                                    <View style={styles.miniLogoBg}>
                                        <MaterialCommunityIcons
                                            name="flower"
                                            size={20}
                                            color={PINK_PRIMARY}
                                        />
                                    </View>
                                    <Text style={styles.brandName}>Mirai Planner</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => router.push("/login")}
                                >
                                    <Text style={styles.navButtonText}>Masuk</Text>
                                </TouchableOpacity>
                            </View>

                            {/* HERO SECTION */}
                            <View
                                style={[
                                    styles.heroSection,
                                    isLargeScreen && styles.heroSectionWeb,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.heroTextContainer,
                                        isLargeScreen && { flex: 1.2 },
                                    ]}
                                >
                                    <View style={styles.badge}>
                                        <MaterialCommunityIcons
                                            name="sparkles"
                                            size={14}
                                            color={PINK_PRIMARY}
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={styles.badgeText}>
                                            Smart Calendar Assistant
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.mainTitle,
                                            isLargeScreen && styles.mainTitleWeb,
                                        ]}
                                    >
                                        Rancang Masa Depanmu Lebih Teratur Bersama AI
                                    </Text>

                                    <Text style={styles.descriptionText}>
                                        Mirai Planner mengintegrasikan Google Calendar dengan
                                        kecerdasan buatan untuk membantu Anda menyusun jadwal,
                                        memantau produktivitas bulanan, dan mengelola agenda harian
                                        secara otomatis lewat obrolan pintar.
                                    </Text>

                                    <TouchableOpacity
                                        style={[
                                            styles.ctaButton,
                                            isLargeScreen && styles.ctaButtonWeb,
                                        ]}
                                        onPress={() => router.push("/login")}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.ctaButtonText}>
                                            Mulai Sekarang gratis
                                        </Text>
                                        <Feather name="arrow-right" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* HERO CARD PREVIEW */}
                                <View
                                    style={[
                                        styles.heroVisualContainer,
                                        isLargeScreen && { flex: 1 },
                                    ]}
                                >
                                    <View style={styles.previewCard}>
                                        <View style={styles.previewHeader}>
                                            <MaterialCommunityIcons
                                                name="robot"
                                                size={22}
                                                color={PINK_PRIMARY}
                                            />
                                            <Text style={styles.previewTitle}>
                                                AI Planner Assistant
                                            </Text>
                                        </View>
                                        <View style={styles.chatBubble}>
                                            <Text style={styles.chatText}>
                                                "Brok, jadwalkan rapat kerja tim besok jam 9 pagi sampai
                                                11 siang ya."
                                            </Text>
                                        </View>
                                        <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                                            <Text style={[styles.chatText, { color: "#FFF" }]}>
                                                "Siap! Rapat Kerja Tim telah disinkronisasikan ke Google
                                                Calendar Anda untuk besok pukul 09:00 WIB."
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* CORE FEATURES INFO SECTION */}
                            <Text style={styles.sectionDividerTitle}>
                                Fitur Utama Platform
                            </Text>
                            <View
                                style={[
                                    styles.featuresGrid,
                                    isLargeScreen && styles.featuresGridWeb,
                                ]}
                            >
                                <View style={styles.featureItem}>
                                    <View
                                        style={[styles.iconWrapper, { backgroundColor: "#FCE4E8" }]}
                                    >
                                        <MaterialCommunityIcons
                                            name="google-calendar"
                                            size={24}
                                            color={PINK_PRIMARY}
                                        />
                                    </View>
                                    <Text style={styles.featureTitle}>Google Calendar Sync</Text>
                                    <Text style={styles.featureDesc}>
                                        Sinkronisasi dua arah yang aman untuk membaca, mengubah, dan
                                        menghapus jadwal harian Anda secara real-time.
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <View
                                        style={[styles.iconWrapper, { backgroundColor: "#EFE5FD" }]}
                                    >
                                        <MaterialCommunityIcons
                                            name="brain"
                                            size={24}
                                            color="#8E69E8"
                                        />
                                    </View>
                                    <Text style={styles.featureTitle}>Natural AI Processing</Text>
                                    <Text style={styles.featureDesc}>
                                        Cukup ketik perintah kasual layaknya mengobrol dengan teman,
                                        asisten AI kami akan langsung menyusun jadwal Anda.
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <View
                                        style={[styles.iconWrapper, { backgroundColor: "#E3F2FD" }]}
                                    >
                                        <Feather name="trending-up" size={24} color="#2196F3" />
                                    </View>
                                    <Text style={styles.featureTitle}>Ringkasan Bulanan</Text>
                                    <Text style={styles.featureDesc}>
                                        Pantau perkembangan produktivitas, total agenda, serta
                                        status jadwal aktif maupun selesai setiap bulannya.
                                    </Text>
                                </View>
                            </View>

                            {/* FOOTER */}
                            <View style={styles.footer}>
                                <Text style={styles.footerBrand}>
                                    © 2026 Mirai Planner. All rights reserved.
                                </Text>
                                <View style={styles.footerLinks}>
                                    <TouchableOpacity onPress={() => openLegalLink("#privacy")}>
                                        <Text style={styles.footerLinkText}>
                                            Kebijakan Privasi (Privacy Policy)
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.footerDivider}>•</Text>
                                    <TouchableOpacity onPress={() => openLegalLink("#terms")}>
                                        <Text style={styles.footerLinkText}>
                                            Syarat & Ketentuan
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </BlurView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%" },
    blurContainer: { flex: 1, backgroundColor: "transparent" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FEF2F4",
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    scrollContainerWeb: {
        paddingHorizontal: 60,
        paddingTop: 30,
        maxWidth: 1200,
        alignSelf: "center",
        width: "100%",
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 48,
        paddingVertical: 10,
    },
    logoRow: { flexDirection: "row", alignItems: "center" },
    miniLogoBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.03)",
    },
    brandName: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2D2D2D",
        marginLeft: 10,
    },
    navButton: {
        borderColor: "#E87A90",
        borderWidth: 1.5,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
    },
    navButtonText: { color: "#E87A90", fontWeight: "700", fontSize: 14 },
    heroSection: {
        marginBottom: 60,
        gap: 32,
    },
    heroSectionWeb: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 80,
    },
    heroTextContainer: {
        alignItems: "flex-start",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(254,232,237,0.9)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeText: { fontSize: 12, fontWeight: "700", color: "#E87A90" },
    mainTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#2D2D2D",
        lineHeight: 42,
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    mainTitleWeb: {
        fontSize: 46,
        lineHeight: 58,
    },
    descriptionText: {
        fontSize: 15,
        color: "#5A5A5A",
        lineHeight: 24,
        marginBottom: 28,
    },
    ctaButton: {
        backgroundColor: "#E87A90",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 28,
        flexDirection: "row",
        alignItems: "center",
        boxShadow: "0px 6px 20px rgba(232,122,144,0.3)",
    },
    ctaButtonWeb: {
        paddingHorizontal: 36,
    },
    ctaButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
        marginRight: 10,
    },
    heroVisualContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    previewCard: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 24,
        padding: 20,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0px 10px 30px rgba(232,122,144,0.12)",
    },
    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2D2D2D",
        marginLeft: 10,
    },
    chatBubble: {
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        marginBottom: 12,
        maxWidth: "85%",
    },
    chatBubbleBot: {
        backgroundColor: "#E87A90",
        alignSelf: "flex-end",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 4,
    },
    chatText: { fontSize: 13, color: "#2D2D2D", lineHeight: 18 },
    sectionDividerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2D2D2D",
        textAlign: "center",
        marginBottom: 24,
    },
    featuresGrid: {
        gap: 16,
        marginBottom: 60,
    },
    featuresGridWeb: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    featureItem: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.75)",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2D2D2D",
        marginBottom: 8,
    },
    featureDesc: { fontSize: 13, color: "#5A5A5A", lineHeight: 20 },
    footer: {
        borderTopWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        paddingTop: 24,
        alignItems: "center",
        gap: 12,
    },
    footerBrand: { fontSize: 13, color: "#7A7A7A" },
    footerLinks: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    footerLinkText: { fontSize: 13, color: "#E87A90", fontWeight: "600" },
    footerDivider: { marginHorizontal: 8, color: "#7A7A7A" },
});
