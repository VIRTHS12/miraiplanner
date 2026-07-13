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
// ✅ Migrasi ke murni SVG Lucide
import {
    ChevronLeft,
    ChevronRight,
    Calendar as LucideCalendar,
    CalendarDays,
    Clock,
    Briefcase,
    Activity,
    BookOpen,
    Trash2,
    Edit2,
    MessageCircle,
    AlertTriangle,
    X,
} from "lucide-react-native";
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

    const [selectedDateString, setSelectedDateString] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });

    const [currentMonthYear, setCurrentMonthYear] = useState("");
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | number | null>(null);

    useEffect(() => {
        const generateDaysInMonth = (referenceDate: Date) => {
            const year = referenceDate.getFullYear();
            const month = referenceDate.getMonth();
            const numDays = new Date(year, month + 1, 0).getDate();
            const daysArr = [];
            const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

            for (let i = 1; i <= numDays; i++) {
                const tempDate = new Date(year, month, i);
                daysArr.push({
                    dayName: dayNames[tempDate.getDay()],
                    dateNumber: i,
                    fullDateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
                });
            }
            setDaysInWeek(daysArr);
            setCurrentMonthYear(
                referenceDate.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                }),
            );
        };
        generateDaysInMonth(currentReferenceDate);
    }, [currentReferenceDate]);

    useEffect(() => {
        setFilteredEvents(
            allEvents.filter((item) =>
                item.start_time?.startsWith(selectedDateString),
            ),
        );
    }, [selectedDateString, allEvents]);

    useFocusEffect(
        useCallback(() => {
            const checkAuthAndLoad = async () => {
                const token =
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
            const res = await fetch(API_URL.CALENDAR_EVENTS, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "69420",
                },
            });
            const json = await res.json();
            if (json.status === "success") setAllEvents(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 FIX 1: BUAT FUNGSI TRIGGER MODAL DELETE NYA BIAR GAK EROR REFERENCE
    const promptDeleteEvent = (id: string | number) => {
        setEventToDelete(id);
        setDeleteModalVisible(true);
    };

    // 🔥 FIX 2: BUAT FUNGSI EKSEKUSI API DELETE JADWAL KE BACKEND
    const handleDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            const token =
                Platform.OS === "web"
                    ? localStorage.getItem("user_token")
                    : await AsyncStorage.getItem("user_token");
            
            if (!token) return;

            // Tembak URL endpoint delete dengan membawa parameter ID lokal
            const res = await fetch(`${API_URL.CALENDAR_EVENTS}/${eventToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json();
            if (json.status === "success") {
                // Refresh list data kalender di local state biar card-nya langsung hilang
                setAllEvents((prev) => prev.filter((evt) => evt.id !== eventToDelete));
            }
        } catch (err) {
            console.error("Gagal mengeksekusi hapus jadwal:", err);
        } finally {
            setDeleteModalVisible(false);
            setEventToDelete(null);
        }
    };

    const getEventIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("rapat") || t.includes("meeting") || t.includes("kerja"))
            return {
                icon: <Briefcase size={20} color={THEME.primary} />,
                bg: "#FCE4E8",
            };
        if (t.includes("olahraga") || t.includes("gym") || t.includes("run"))
            return { icon: <Activity size={20} color="#9C27B0" />, bg: "#EFE5FD" };
        return { icon: <BookOpen size={20} color="#2196F3" />, bg: "#E3F2FD" };
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
            <BlurView intensity={30} tint="light" style={styles.flexArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={24} color={THEME.textDark} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{currentMonthYear}</Text>
                        <Text style={styles.headerSubtitle}>Agenda Saya</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => {
                                /* ...logic prev month */
                            }}
                        >
                            <ChevronLeft size={20} color={THEME.textDark} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => {
                                /* ...logic next month */
                            }}
                        >
                            <ChevronRight size={20} color={THEME.textDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bagian Calendar Strip */}
                <View style={styles.weekSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.weekContainer}
                    >
                        {daysInWeek.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayCard,
                                    item.fullDateString === selectedDateString &&
                                    styles.dayCardActive,
                                ]}
                                onPress={() => setSelectedDateString(item.fullDateString)}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        item.fullDateString === selectedDateString &&
                                        styles.textWhite,
                                    ]}
                                >
                                    {item.dayName}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateText,
                                        item.fullDateString === selectedDateString &&
                                        styles.textWhite,
                                    ]}
                                >
                                    {item.dateNumber}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* List Event */}
                <View style={styles.eventsWrapper}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Jadwal Terpilih</Text>
                        <Text style={styles.eventCount}>
                            {filteredEvents.length} Agenda
                        </Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.eventContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color={THEME.primary} style={{ marginTop: 20 }} />
                        ) : filteredEvents.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Tidak ada agenda kegiatan hari ini, brok.</Text>
                            </View>
                        ) : (
                            filteredEvents.map((event, idx) => {
                                const meta = getEventIcon(event.title);
                                return (
                                    <View key={idx} style={styles.eventCard}>
                                        <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                                            {meta.icon}
                                        </View>
                                        <View style={styles.eventInfo}>
                                            <Text style={styles.eventTitle}>{event.title}</Text>
                                            <View style={styles.timeRow}>
                                                <Clock size={12} color={THEME.textGray} />
                                                <Text style={styles.eventTime}>
                                                    {event.start_time?.substring(11, 16)} WIB
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.eventAction}>
                                            <TouchableOpacity
                                                style={{ marginRight: 12 }}
                                                onPress={() =>
                                                    router.push({
                                                        pathname: "/edit-event",
                                                        params: { event: JSON.stringify(event) },
                                                    })
                                                }
                                            >
                                                <Edit2 size={18} color="#2196F3" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ marginRight: 12 }}
                                                onPress={() => promptDeleteEvent(event.id)}
                                            >
                                                <Trash2 size={18} color="#F44336" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    router.push({
                                                        pathname: "/chatscreen",
                                                        params: { attachedEvent: JSON.stringify(event) },
                                                    })
                                                }
                                            >
                                                <MessageCircle size={18} color={THEME.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </BlurView>

            {/* 🔥 FIX 3: RENDER ELEMEN MODAL KONFIRMASI NYA BIAR GAK MUBAZIR STYLES-NYA */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBg}>
                            <AlertTriangle size={32} color="#F44336" />
                        </View>
                        <Text style={styles.modalTitle}>Hapus Jadwal?</Text>
                        <Text style={styles.modalMessage}>
                            Agenda kegiatan ini bakal dihapus permanen dari pangkalan Google Calendar lu, brok.
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
                                onPress={handleDeleteEvent}
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
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        color: THEME.textGray,
        fontSize: 14,
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
