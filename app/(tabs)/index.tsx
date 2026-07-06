import React, { useState, useEffect, useCallback } from "react";
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
    useWindowDimensions,
} from "react-native";
import {
    Feather,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

export default function HomeScreen() {
    const PINK_PRIMARY = "#E87A90";
    const TEXT_DARK = "#2D2D2D";
    const TEXT_LIGHT = "#7A7A7A";

    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 768;

    const [weeklyStats, setWeeklyStats] = useState({
        total: 0,
        aktif: 0,
        selesai: 0,
    });
    const [userData, setUserData] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useLocalSearchParams();

    // 🧠 CHECKPOINT AUTENTIKASI
    useFocusEffect(
        useCallback(() => {
            const checkAuthAndLoad = async () => {
                let token = null;
                if (params.token) {
                    const tokenStr = params.token as string;
                    const userStr = params.user as string;
                    if (Platform.OS === "web") {
                        localStorage.setItem("user_token", tokenStr);
                        if (userStr) localStorage.setItem("userData", userStr);
                    } else {
                        await AsyncStorage.setItem("user_token", tokenStr);
                        if (userStr) await AsyncStorage.setItem("userData", userStr);
                    }
                    token = tokenStr;
                    router.setParams({ token: undefined, user: undefined });
                } else {
                    token =
                        Platform.OS === "web"
                            ? localStorage.getItem("user_token")
                            : await AsyncStorage.getItem("user_token");
                }

                if (!token) {
                    router.replace("/login");
                    return;
                }
                await fetchDashboardData(token);
            };
            checkAuthAndLoad();
        }, [params.token]),
    );

    const fetchDashboardData = async (token: string) => {
        try {
            let storedUser = null;
            if (Platform.OS === "web") {
                storedUser = localStorage.getItem("userData");
            } else {
                storedUser = await AsyncStorage.getItem("userData");
            }
            setUserData(storedUser ? JSON.parse(storedUser) : { name: "Pengguna" });

            const resEvents = await fetch(API_URL.CALENDAR_EVENTS, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "69420",
                },
            });
            const jsonEvents = await resEvents.json();

            if (jsonEvents.status === "success" && Array.isArray(jsonEvents.data)) {
                const now = new Date();
                const todayFormatted = now.toISOString().split("T")[0];

                // 📅 Ambil String "YYYY-MM" Bulan Ini untuk filter summary
                const currentMonthPrefix = todayFormatted.substring(0, 7);

                // 1. Filter untuk Jadwal Hari Ini
                const todaysEvents = jsonEvents.data.filter((item: any) =>
                    item.start_time?.startsWith(todayFormatted),
                );
                setEvents(todaysEvents);

                // 2. 🔥 KUNCI UTAMA: Filter data khusus untuk bulan ini saja sebelum menghitung summary
                const monthlyEvents = jsonEvents.data.filter((item: any) =>
                    item.start_time?.startsWith(currentMonthPrefix),
                );

                const total = monthlyEvents.length;
                const selesai = monthlyEvents.filter((item: any) => {
                    if (!item.end_time) return false;
                    return new Date(item.end_time.replace(" ", "T")) < now;
                }).length;

                setWeeklyStats({ total, aktif: total - selesai, selesai });
            }
        } catch (err) {
            console.error("Gagal sinkronisasi data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        if (Platform.OS === "web") {
            localStorage.removeItem("user_token");
            localStorage.removeItem("userData");
        } else {
            await AsyncStorage.removeItem("user_token");
            await AsyncStorage.removeItem("userData");
        }
        router.replace("/login");
    };

    const getEventIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("rapat") || t.includes("meeting") || t.includes("kerja"))
            return <Feather name="briefcase" size={20} color={PINK_PRIMARY} />;
        if (t.includes("olahraga") || t.includes("gym") || t.includes("run"))
            return <FontAwesome5 name="running" size={20} color="#8E69E8" />;
        return <Feather name="book" size={20} color="#2196F3" />;
    };

    const getIconBg = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("rapat") || t.includes("meeting") || t.includes("kerja"))
            return "#FCE4E8";
        if (t.includes("olahraga") || t.includes("gym") || t.includes("run"))
            return "#EFE5FD";
        return "#E3F2FD";
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PINK_PRIMARY} />
                <Text style={{ marginTop: 16, color: TEXT_DARK, fontWeight: "600" }}>
                    Memeriksa Autentikasi...
                </Text>
            </View>
        );
    }

    const renderDailySchedule = () => (
        <View style={[styles.card, isLargeScreen && styles.cardWeb]}>
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name="calendar" size={18} color={TEXT_DARK} />
                    <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
                </View>
                <View style={styles.dateBadge}>
                    <Feather
                        name="clock"
                        size={12}
                        color={PINK_PRIMARY}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.dateBadgeText}>
                        {new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </Text>
                </View>
            </View>

            {events.length === 0 ? (
                <View style={styles.emptyCard}>
                    <MaterialCommunityIcons
                        name="calendar-blank-outline"
                        size={32}
                        color={PINK_PRIMARY}
                    />
                    <Text style={styles.emptyText}>Tidak ada jadwal untuk hari ini.</Text>
                </View>
            ) : (
                events.map((item, idx) => {
                    const startTime = item.start_time?.substring(11, 16) || "00:00";
                    const endTime = item.end_time?.substring(11, 16) || "00:00";
                    return (
                        <View key={item.id || idx} style={styles.scheduleCard}>
                            <View
                                style={[
                                    styles.iconBox,
                                    { backgroundColor: getIconBg(item.title) },
                                ]}
                            >
                                {getEventIcon(item.title)}
                            </View>
                            <View style={styles.scheduleInfo}>
                                <Text style={styles.scheduleTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text style={styles.scheduleTime}>
                                    {startTime} – {endTime} WIB
                                </Text>
                            </View>
                            <View style={styles.sourceTag}>
                                <MaterialCommunityIcons
                                    name="google"
                                    size={12}
                                    color="#DB4437"
                                />
                                <Text style={styles.sourceText}>Synced</Text>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );

    const renderWeeklySummary = () => (
        <View style={[styles.card, isLargeScreen && styles.cardWeb]}>
            <View style={[styles.sectionHeader, { marginBottom: 20 }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                        name="chart-timeline-variant"
                        size={20}
                        color={PINK_PRIMARY}
                    />
                    {/* Ubah Title menjadi Bulan Ini */}
                    <Text style={styles.sectionTitle}>Ringkasan Bulan Ini</Text>
                </View>
            </View>
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIconBox, { backgroundColor: "#FCE4E8" }]}>
                        <Feather name="calendar" size={18} color={PINK_PRIMARY} />
                    </View>
                    <Text style={styles.summaryNumber}>{weeklyStats.total}</Text>
                    <Text style={styles.summaryLabel}>Total Jadwal</Text>
                </View>
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIconBox, { backgroundColor: "#EFE5FD" }]}>
                        <Feather name="check-circle" size={18} color="#8E69E8" />
                    </View>
                    <Text style={styles.summaryNumber}>{weeklyStats.aktif}</Text>
                    <Text style={styles.summaryLabel}>Aktif</Text>
                </View>
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIconBox, { backgroundColor: "#E3F2FD" }]}>
                        <Feather name="clock" size={18} color="#2196F3" />
                    </View>
                    <Text style={styles.summaryNumber}>{weeklyStats.selesai}</Text>
                    <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require("@/assets/images/fotobackground.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={[
                    "rgba(255,255,255,0.92)",
                    "rgba(254,238,242,0.65)",
                    "rgba(254,228,234,0.9)",
                ]}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            >
                <BlurView intensity={18} tint="light" style={styles.blurContainer}>
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
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity onPress={handleLogout}>
                                    <Feather name="log-out" size={24} color={TEXT_DARK} />
                                </TouchableOpacity>
                            </View>

                            {/* Greeting + AI Card */}
                            <View
                                style={[
                                    styles.topSection,
                                    isLargeScreen && styles.topSectionWeb,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.greetingContainer,
                                        isLargeScreen && styles.greetingContainerWeb,
                                    ]}
                                >
                                    <Text style={styles.greetingText}>Kon'nichiwa,</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={styles.nameText}>
                                            {userData?.name || "Raihan"}{" "}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name="flower"
                                            size={30}
                                            color={PINK_PRIMARY}
                                        />
                                    </View>
                                    <Text style={styles.subtitleText}>
                                        Mirai Planner siap membantu menyusun rencana terbaikmu hari
                                        ini.
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.aiCardWrapper,
                                        isLargeScreen && styles.aiCardWrapperWeb,
                                    ]}
                                >
                                    <View style={styles.aiCard}>
                                        <View style={styles.aiHeader}>
                                            <View style={styles.aiIconBg}>
                                                <MaterialCommunityIcons
                                                    name="flower"
                                                    size={24}
                                                    color={PINK_PRIMARY}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 14 }}>
                                                <Text style={styles.aiTitle}>AI Planner Assistant</Text>
                                                <Text style={styles.aiSubtitle}>
                                                    Buat jadwal, ubah rencana, atau tanya apa saja tentang
                                                    harimu.
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.aiButton}
                                            onPress={() => router.push("/chatscreen")}
                                        >
                                            <Text style={styles.aiButtonText}>Mulai Chat</Text>
                                            <Feather name="chevron-right" size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Konten utama */}
                            {isLargeScreen ? (
                                <View style={styles.twoColumn}>
                                    <View style={{ flex: 1, marginRight: 16 }}>
                                        {renderDailySchedule()}
                                    </View>
                                    <View style={{ flex: 1 }}>{renderWeeklySummary()}</View>
                                </View>
                            ) : (
                                <>
                                    {renderDailySchedule()}
                                    <View style={{ marginTop: 20 }}>{renderWeeklySummary()}</View>
                                </>
                            )}

                            <View style={{ height: 100 }} />
                        </ScrollView>
                    </SafeAreaView>
                </BlurView>
            </LinearGradient>
        </ImageBackground>
    );
}

const CARD_SHADOW = Platform.select({
    web: {
        boxShadow: "0px 10px 25px rgba(232,122,144,0.12)",
    },
    default: {
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
});

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: "100%", height: "100%" },
    blurContainer: { flex: 1, backgroundColor: "transparent" },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    scrollContainerWeb: {
        paddingHorizontal: 40,
        paddingTop: 70,
        maxWidth: 1100,
        alignSelf: "center",
        width: "100%",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FEF2F4",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 28,
    },
    topSection: {
        marginBottom: 32,
    },
    topSectionWeb: {
        flexDirection: "row",
        alignItems: "center",
        gap: 32,
    },
    greetingContainer: {
        marginBottom: 24,
    },
    greetingContainerWeb: {
        flex: 1,
        marginBottom: 0,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: "500",
        color: "#2D2D2D",
        letterSpacing: -0.3,
    },
    nameText: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#E87A90",
        marginTop: 2,
    },
    subtitleText: {
        fontSize: 14,
        color: "#5A5A5A",
        marginTop: 10,
        lineHeight: 22,
    },
    aiCardWrapper: {
        width: "100%",
    },
    aiCardWrapperWeb: {
        flex: 1,
        maxWidth: 400,
    },
    aiCard: {
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 28,
        padding: 22,
        ...CARD_SHADOW,
    },
    aiHeader: {
        flexDirection: "row",
        marginBottom: 18,
        alignItems: "center",
    },
    aiIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: { elevation: 2 },
            web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.04)" },
        }),
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2D2D2D",
    },
    aiSubtitle: {
        fontSize: 13,
        color: "#5A5A5A",
        marginTop: 4,
        lineHeight: 19,
    },
    aiButton: {
        backgroundColor: "#E87A90",
        borderRadius: 16,
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            web: { boxShadow: "0px 6px 14px rgba(232,122,144,0.35)" },
            default: {
                shadowColor: "#E87A90",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 3,
            },
        }),
    },
    aiButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
        marginRight: 8,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.88)",
        borderRadius: 24,
        padding: 20,
        ...CARD_SHADOW,
    },
    cardWeb: {
        borderRadius: 28,
        padding: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2D2D2D",
        marginLeft: 10,
    },
    scheduleCard: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        ...Platform.select({
            web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.03)" },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            },
        }),
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    scheduleInfo: { flex: 1 },
    scheduleTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2D2D2D",
        marginBottom: 4,
    },
    scheduleTime: { fontSize: 13, color: "#7A7A7A", fontWeight: "500" },
    sourceTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    sourceText: {
        fontSize: 11,
        color: "#7A7A7A",
        marginLeft: 4,
        fontWeight: "600",
    },
    twoColumn: {
        flexDirection: "row",
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryItem: { alignItems: "center", flex: 1 },
    summaryIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
            },
            android: { elevation: 1 },
        }),
    },
    summaryNumber: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2D2D2D",
        marginBottom: 4,
    },
    summaryLabel: { fontSize: 13, color: "#7A7A7A", fontWeight: "500" },
    dateBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(254,232,237,0.9)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dateBadgeText: { fontSize: 13, fontWeight: "700", color: "#E87A90" },
    emptyCard: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderRadius: 20,
        padding: 28,
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "dashed",
        borderWidth: 1.5,
        borderColor: "#E87A90",
    },
    emptyText: {
        color: "#A0A0A0",
        fontSize: 13,
        fontWeight: "500",
        marginTop: 10,
        fontStyle: "italic",
    },
});
