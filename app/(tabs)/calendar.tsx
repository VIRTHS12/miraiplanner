import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    Modal,
} from "react-native";
import {
    Feather,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useFocusEffect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

const THEME = {
    primary: "#E87A90",
    bg: "#FEF6F8",
    surface: "#FFFFFF",
    textDark: "#2C2C2C",
    textGray: "#757575",
    textLight: "#A0A0A0",
    border: "#F0F0F0",
};

const shadows = {
    soft: {
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    medium: {
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
};

export default function CalendarScreen() {
    const [loading, setLoading] = useState(true);
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const [daysInWeek, setDaysInWeek] = useState<any[]>([]);

    const [currentReferenceDate, setCurrentReferenceDate] = useState(new Date());

    // Inisialisasi tanggal hari ini dengan format YYYY-MM-DD yang presisi
    const [selectedDateString, setSelectedDateString] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });

    const [currentMonthYear, setCurrentMonthYear] = useState("");
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | number | null>(
        null,
    );

    // 🛠️ GENERATE SEBULAN PENUH BERDASARKAN TANGGAL ACUAN
    useEffect(() => {
        const generateDaysInMonth = (referenceDate: Date) => {
            const year = referenceDate.getFullYear();
            const month = referenceDate.getMonth();

            const numDays = new Date(year, month + 1, 0).getDate();
            const daysArr = [];
            const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

            for (let i = 1; i <= numDays; i++) {
                const tempDate = new Date(year, month, i);
                const monthStr = String(month + 1).padStart(2, "0");
                const dayStr = String(i).padStart(2, "0");
                const fullDateString = `${year}-${monthStr}-${dayStr}`;

                daysArr.push({
                    dayName: dayNames[tempDate.getDay()],
                    dateNumber: i,
                    fullDateString: fullDateString,
                });
            }

            setDaysInWeek(daysArr);

            const monthName = referenceDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
            });
            setCurrentMonthYear(monthName);
        };

        generateDaysInMonth(currentReferenceDate);
    }, [currentReferenceDate]);

    // Jalankan filter lokal setiap kali `allEvents` selesai di-fetch atau `selectedDateString` berubah
    useEffect(() => {
        if (allEvents.length > 0) {
            const filtered = allEvents.filter((item: any) => {
                if (!item.start_time) return false;
                return item.start_time.startsWith(selectedDateString);
            });
            setFilteredEvents(filtered);
        } else {
            setFilteredEvents([]);
        }
    }, [selectedDateString, allEvents]);

    // Ambil data dari server PHP setiap kali screen fokus
    useFocusEffect(
        useCallback(() => {
            const checkAuthAndLoad = async () => {
                let token =
                    Platform.OS === "web"
                        ? localStorage.getItem("user_token")
                        : await AsyncStorage.getItem("user_token");

                if (!token) {
                    router.replace("/login");
                    return;
                }

                await fetchCalendarData(token);
            };

            checkAuthAndLoad();
        }, []),
    );

    const fetchCalendarData = async (token: string) => {
        try {
            setLoading(true);
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
                setAllEvents(jsonEvents.data);
            }
        } catch (err) {
            console.error("Gagal memuat kalender dari server PHP:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (dateStr: string) => {
        setSelectedDateString(dateStr);
    };

    const handleMonthChange = (direction: "prev" | "next") => {
        const nextDate = new Date(currentReferenceDate);
        if (direction === "prev") {
            nextDate.setMonth(currentReferenceDate.getMonth() - 1);
        } else {
            nextDate.setMonth(currentReferenceDate.getMonth() + 1);
        }

        // Auto-select ke tanggal 1 di bulan yang baru dibuka
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, "0");
        const dayStr = "01";

        setSelectedDateString(`${year}-${month}-${dayStr}`);
        setCurrentReferenceDate(nextDate);
    };

    const promptDeleteEvent = (eventId: string | number) => {
        setEventToDelete(eventId);
        setDeleteModalVisible(true);
    };

    const executeDelete = async () => {
        if (!eventToDelete) return;

        try {
            setLoading(true);
            setDeleteModalVisible(false);

            let token =
                Platform.OS === "web"
                    ? localStorage.getItem("user_token")
                    : await AsyncStorage.getItem("user_token");

            const res = await fetch(`${API_URL.CALENDAR_EVENT}?id=${eventToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "69420",
                },
            });

            const result = await res.json();
            if (result.status === "success") {
                await fetchCalendarData(token as string);
            }
        } catch (error) {
            console.error("Error delete event:", error);
        } finally {
            setLoading(false);
            setEventToDelete(null);
        }
    };

    const getEventIcon = (title: string) => {
        const lowerTitle = title?.toLowerCase() || "";
        if (
            lowerTitle.includes("rapat") ||
            lowerTitle.includes("meeting") ||
            lowerTitle.includes("kerja")
        ) {
            return { name: "briefcase", color: THEME.primary, bg: "#FCE4E8" };
        }
        if (
            lowerTitle.includes("olahraga") ||
            lowerTitle.includes("gym") ||
            lowerTitle.includes("run")
        ) {
            return { name: "activity", color: "#9C27B0", bg: "#EFE5FD" };
        }
        return { name: "book", color: "#2196F3", bg: "#E3F2FD" };
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

            <BlurView intensity={30} tint="light" style={styles.flexArea}>
                {/* Header Panel */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Feather name="chevron-left" size={24} color={THEME.textDark} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{currentMonthYear}</Text>
                        <Text style={styles.headerSubtitle}>Agenda Saya</Text>
                    </View>

                    {/* Navigasi Bulan */}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            onPress={() => handleMonthChange("prev")}
                        >
                            <Feather name="chevron-left" size={20} color={THEME.textDark} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            onPress={() => handleMonthChange("next")}
                        >
                            <Feather name="chevron-right" size={20} color={THEME.textDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Week Row Slider (Bisa di-scroll horizontal sebulan penuh) */}
                <View style={styles.weekSection}>
                    {loading && allEvents.length === 0 ? (
                        <View style={{ height: 85, justifyContent: "center" }}>
                            <ActivityIndicator size="small" color={THEME.primary} />
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.weekContainer}
                        >
                            {daysInWeek.map((item, index) => {
                                const isActive = item.fullDateString === selectedDateString;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.8}
                                        style={[styles.dayCard, isActive && styles.dayCardActive]}
                                        onPress={() => handleDateSelect(item.fullDateString)}
                                    >
                                        <Text
                                            style={[styles.dayText, isActive && styles.textWhite]}
                                        >
                                            {item.dayName}
                                        </Text>
                                        <Text
                                            style={[styles.dateText, isActive && styles.textWhite]}
                                        >
                                            {item.dateNumber}
                                        </Text>
                                        {isActive && <View style={styles.activeDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Events List */}
                <View style={styles.eventsWrapper}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Jadwal Terpilih</Text>
                        <Text style={styles.eventCount}>
                            {filteredEvents.length} Agenda
                        </Text>
                    </View>

                    {loading && allEvents.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={THEME.primary} />
                            <Text
                                style={{
                                    marginTop: 12,
                                    color: THEME.textDark,
                                    fontWeight: "500",
                                }}
                            >
                                Sinkronisasi Kalender...
                            </Text>
                        </View>
                    ) : filteredEvents.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons
                                name="calendar-blank"
                                size={48}
                                color={THEME.textLight}
                            />
                            <Text style={styles.emptyText}>
                                Tidak ada agenda untuk tanggal ini, brok.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.eventContainer}
                        >
                            {filteredEvents.map((event, idx) => {
                                const iconMeta = getEventIcon(event.title);
                                const startTime = event.start_time
                                    ? event.start_time.substring(11, 16)
                                    : "00:00";
                                const endTime = event.end_time
                                    ? event.end_time.substring(11, 16)
                                    : "00:00";

                                return (
                                    <View key={event.id || idx} style={styles.eventCard}>
                                        <View
                                            style={[styles.iconBox, { backgroundColor: iconMeta.bg }]}
                                        >
                                            <Feather
                                                name={iconMeta.name}
                                                size={20}
                                                color={iconMeta.color}
                                            />
                                        </View>

                                        <View style={styles.eventInfo}>
                                            <Text style={styles.eventTitle}>{event.title}</Text>
                                            <View style={styles.timeRow}>
                                                <Feather
                                                    name="clock"
                                                    size={12}
                                                    color={THEME.textGray}
                                                />
                                                <Text style={styles.eventTime}>
                                                    {startTime} - {endTime} WIB
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.eventAction}>
                                            <MaterialCommunityIcons
                                                name="google"
                                                size={16}
                                                color="#DB4437"
                                                style={{ marginRight: 6 }}
                                            />

                                            <TouchableOpacity
                                                style={{ padding: 6 }}
                                                onPress={() => {
                                                    router.push({
                                                        pathname: "/edit-event",
                                                        params: { event: JSON.stringify(event) },
                                                    });
                                                }}
                                            >
                                                <Feather name="edit-2" size={18} color="#2196F3" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{ padding: 6 }}
                                                onPress={() => promptDeleteEvent(event.id)}
                                            >
                                                <Feather name="trash-2" size={18} color="#F44336" />
                                            </TouchableOpacity>

                                            {/* 🔥 TOMBOL BARU: BAWA EVENT KE CHAT SCREEN 🔥 */}
                                            <TouchableOpacity
                                                style={{ padding: 6, marginLeft: 2 }}
                                                onPress={() => {
                                                    router.push({
                                                        pathname: "/chatscreen",
                                                        params: { attachedEvent: JSON.stringify(event) },
                                                    });
                                                }}
                                            >
                                                <Feather
                                                    name="message-circle"
                                                    size={18}
                                                    color={THEME.primary}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            </BlurView>

            {/* Delete Modal */}
            <Modal
                transparent={true}
                visible={isDeleteModalVisible}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBg}>
                            <Feather name="alert-triangle" size={32} color="#F44336" />
                        </View>
                        <Text style={styles.modalTitle}>Hapus Agenda?</Text>
                        <Text style={styles.modalMessage}>
                            Yakin mau menghapus agenda ini brok? Tindakan ini tidak bisa
                            dibatalkan.
                        </Text>

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonDelete]}
                                onPress={executeDelete}
                            >
                                <Text style={styles.modalButtonTextDelete}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    flexArea: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.surface,
        justifyContent: "center",
        alignItems: "center",
        ...shadows.soft,
    },
    headerTitleContainer: { alignItems: "center", flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: THEME.textDark },
    headerSubtitle: {
        fontSize: 12,
        color: THEME.textGray,
        marginTop: 2,
        fontWeight: "500",
    },
    weekSection: { marginBottom: 24 },
    weekContainer: { paddingHorizontal: 20, paddingBottom: 10 },
    dayCard: {
        width: 62,
        height: 85,
        borderRadius: 24,
        backgroundColor: THEME.surface,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    dayCardActive: {
        backgroundColor: THEME.primary,
        borderColor: THEME.primary,
        ...shadows.medium,
    },
    dayText: {
        fontSize: 13,
        color: THEME.textGray,
        fontWeight: "500",
        marginBottom: 4,
    },
    dateText: { fontSize: 18, fontWeight: "700", color: THEME.textDark },
    textWhite: { color: THEME.surface },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: THEME.surface,
        marginTop: 6,
        position: "absolute",
        bottom: 12,
    },
    eventsWrapper: {
        flex: 1,
        backgroundColor: THEME.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...shadows.soft,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: THEME.textDark },
    eventCount: {
        fontSize: 13,
        color: THEME.primary,
        fontWeight: "600",
        backgroundColor: "#FCE4E8",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    eventContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    eventCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: THEME.border,
        ...shadows.soft,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    eventInfo: { flex: 1 },
    eventTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: THEME.textDark,
        marginBottom: 6,
    },
    timeRow: { flexDirection: "row", alignItems: "center" },
    eventTime: {
        fontSize: 13,
        color: THEME.textGray,
        marginLeft: 6,
        fontWeight: "500",
    },
    eventAction: { flexDirection: "row", alignItems: "center" },
    emptyContainer: {
        flex: 0.7,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        color: THEME.textGray,
        fontSize: 14,
        marginTop: 12,
        textAlign: "center",
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: THEME.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        ...shadows.medium,
    },
    modalIconBg: {
        backgroundColor: "#FFEBEE",
        marginBottom: 16,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: THEME.textDark,
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: THEME.textGray,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    modalActionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    modalButtonCancel: {
        backgroundColor: "#F5F5F5",
        marginRight: 8,
    },
    modalButtonDelete: {
        backgroundColor: "#F44336",
        marginLeft: 8,
    },
    modalButtonTextCancel: {
        color: THEME.textDark,
        fontWeight: "600",
        fontSize: 15,
    },
    modalButtonTextDelete: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 15,
    },
});
