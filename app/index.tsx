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
import { 
    Flower, 
    Sparkles, 
    ArrowRight, 
    Bot, 
    Calendar, 
    Brain, 
    TrendingUp 
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

export default function LandingScreen() {
    const PINK_PRIMARY = "#E87A90";

    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 768;

    const [isChecking, setIsChecking] = useState(true);

    // ✅ FIX UTAMA 1 & 2: Arahkan ke file dokumen statis di bawah root domain yang sama (Cloudflare Pages)
    // Taruh file privacy.html dan terms.html di folder public/ lu!
    const openLegalLink = (pageName: string) => {
        const url = `https://miraiplanner.pages.dev/${pageName}.html`;
        Linking.openURL(url).catch((err) =>
            console.error("Gagal membuka URL:", err),
        );
    };

    useEffect(() => {
        const checkExistingAuth = async () => {
            try {
                const token =
                    Platform.OS === "web"
                        ? localStorage.getItem("user_token")
                        : await AsyncStorage.getItem("user_token");

                if (token) {
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
                    "rgba(255,255,255,0.92)",
                    "rgba(254,238,242,0.80)",
                    "rgba(254,228,234,0.95)",
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
                            {/* TOP NAVBAR */}
                            <View style={styles.navbar}>
                                <View style={styles.logoRow}>
                                    <View style={styles.miniLogoBg}>
                                        <Flower size={20} color={PINK_PRIMARY} />
                                    </View>
                                    {/* ✅ FIX UTAMA 4: Pertegas teks nama aplikasi agar match 100% dengan OAuth Console */}
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
                            <View style={[styles.heroSection, isLargeScreen && styles.heroSectionWeb]}>
                                <View style={[styles.heroTextContainer, isLargeScreen && { flex: 1.2 }]}>
                                    <View style={styles.badge}>
                                        <Sparkles 
                                            size={14} 
                                            color={PINK_PRIMARY} 
                                            style={{ marginRight: 6 }} 
                                        />
                                        <Text style={styles.badgeText}>
                                            Smart Google Calendar AI Assistant
                                        </Text>
                                    </View>

                                    {/* ✅ FIX UTAMA 4: Masukkan keyword nama aplikasi di dalam Title */}
                                    <Text style={[styles.mainTitle, isLargeScreen && styles.mainTitleWeb]}>
                                        Mirai Planner - Rancang Masa Depanmu Lebih Teratur Bersama AI
                                    </Text>

                                    {/* ✅ FIX UTAMA 3: Deskripsi super jelas mengenai tujuan integrasi Google Calendar & AI (Lolos Sensor Bot Google) */}
                                    <Text style={styles.descriptionText}>
                                        Mirai Planner adalah aplikasi asisten pintar yang mengintegrasikan akun Google Calendar Anda dengan model kecerdasan buatan (AI). Aplikasi ini dirancang secara khusus untuk membantu pengguna menyusun jadwal kegiatan, mendeteksi bentrok agenda harian, memantau produktivitas bulanan, serta mengotomatisasi pembuatan pengingat jadwal kerja secara instan melalui antarmuka obrolan percakapan yang aman.
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.ctaButton, isLargeScreen && styles.ctaButtonWeb]}
                                        onPress={() => router.push("/login")}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.ctaButtonText}>
                                            Mulai Sekarang, Gratis!
                                        </Text>
                                        <ArrowRight size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* HERO CARD PREVIEW */}
                                <View style={[styles.heroVisualContainer, isLargeScreen && { flex: 1 }]}>
                                    <View style={styles.previewCard}>
                                        <View style={styles.previewHeader}>
                                            <Bot size={22} color={PINK_PRIMARY} />
                                            <Text style={styles.previewTitle}>
                                                Mirai Planner Assistant
                                            </Text>
                                        </View>
                                        <View style={styles.chatBubble}>
                                            <Text style={styles.chatText}>
                                                "Brok, jadwalkan rapat kerja tim besok jam 9 pagi sampai 11 siang ya."
                                            </Text>
                                        </View>
                                        <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                                            <Text style={[styles.chatText, { color: "#FFF" }]}>
                                                "Siap! Rapat Kerja Tim telah disinkronisasikan ke Google Calendar Anda untuk besok pukul 09:00 WIB."
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* CORE FEATURES INFO SECTION */}
                            <Text style={styles.sectionDividerTitle}>
                                Fitur Utama Platform Mirai Planner
                            </Text>
                            <View style={[styles.featuresGrid, isLargeScreen && styles.featuresGridWeb]}>
                                <View style={styles.featureItem}>
                                    <View style={[styles.iconWrapper, { backgroundColor: "#FCE4E8" }]}>
                                        <Calendar size={24} color={PINK_PRIMARY} />
                                    </View>
                                    <Text style={styles.featureTitle}>Google Calendar Sync</Text>
                                    <Text style={styles.featureDesc}>
                                        Sinkronisasi dua arah yang aman untuk membaca, mengubah, dan menghapus jadwal harian Anda secara real-time langsung ke kalender Google.
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <View style={[styles.iconWrapper, { backgroundColor: "#EFE5FD" }]}>
                                        <Brain size={24} color="#8E69E8" />
                                    </View>
                                    <Text style={styles.featureTitle}>Natural AI Processing</Text>
                                    <Text style={styles.featureDesc}>
                                        Cukup ketik perintah kasual layaknya mengobrol dengan teman, asisten AI kami akan langsung menyusun poin agenda kalender Anda.
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <View style={[styles.iconWrapper, { backgroundColor: "#E3F2FD" }]}>
                                        <TrendingUp size={24} color="#2196F3" />
                                    </View>
                                    <Text style={styles.featureTitle}>Ringkasan Bulanan</Text>
                                    <Text style={styles.featureDesc}>
                                        Pantau perkembangan produktivitas, total agenda, serta analisis status jadwal aktif maupun selesai setiap bulannya.
                                    </Text>
                                </View>
                            </View>

                            {/* FOOTER */}
                            <View style={styles.footer}>
                                <Text style={styles.footerBrand}>
                                    © 2026 Mirai Planner. All rights reserved.
                                </Text>
                                <View style={styles.footerLinks}>
                                    {/* ✅ FIX UTAMA 1: Pemanggilan fungsi link legalitas baru tanpa hash parameter */}
                                    <TouchableOpacity onPress={() => openLegalLink("privacy")}>
                                        <Text style={styles.footerLinkText}>
                                            Privacy Policy
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.footerDivider}>•</Text>
                                    <TouchableOpacity onPress={() => openLegalLink("terms")}>
                                        <Text style={styles.footerLinkText}>
                                            Terms of Service
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
    scrollContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
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
    heroSection: { marginBottom: 60, gap: 32 },
    heroSectionWeb: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 80 },
    heroTextContainer: { alignItems: "flex-start" },
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
    mainTitleWeb: { fontSize: 44, lineHeight: 56 },
    descriptionText: { fontSize: 14, color: "#5A5A5A", lineHeight: 24, marginBottom: 28, textAlign: "justify" },
    ctaButton: {
        backgroundColor: "#E87A90",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 28,
        flexDirection: "row",
        alignItems: "center",
    },
    ctaButtonWeb: { paddingHorizontal: 36 },
    ctaButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16, marginRight: 10 },
    heroVisualContainer: { width: "100%", alignItems: "center", justifyContent: "center" },
    previewCard: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 24,
        padding: 20,
        width: "100%",
        maxWidth: 420,
    },
    previewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    previewTitle: { fontSize: 15, fontWeight: "700", color: "#2D2D2D", marginLeft: 10 },
    chatBubble: {
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        marginBottom: 12,
        maxWidth: "85%",
    },
    chatBubbleBot: { backgroundColor: "#E87A90", alignSelf: "flex-end", borderTopLeftRadius: 16, borderTopRightRadius: 4 },
    chatText: { fontSize: 13, color: "#2D2D2D", lineHeight: 18 },
    sectionDividerTitle: { fontSize: 18, fontWeight: "700", color: "#2D2D2D", textAlign: "center", marginBottom: 24 },
    featuresGrid: { gap: 16, marginBottom: 60 },
    featuresGridWeb: { flexDirection: "row", justifyContent: "space-between" },
    featureItem: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.75)",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
    },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    featureTitle: { fontSize: 16, fontWeight: "700", color: "#2D2D2D", marginBottom: 8 },
    featureDesc: { fontSize: 13, color: "#5A5A5A", lineHeight: 20 },
    footer: { borderTopWidth: 1, borderColor: "rgba(0,0,0,0.06)", paddingTop: 24, alignItems: "center", gap: 12 },
    footerBrand: { fontSize: 13, color: "#7A7A7A" },
    footerLinks: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center" },
    footerLinkText: { fontSize: 13, color: "#E87A90", fontWeight: "600" },
    footerDivider: { marginHorizontal: 8, color: "#7A7A7A" },

});
