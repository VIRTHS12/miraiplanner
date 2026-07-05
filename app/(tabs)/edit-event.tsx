import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Modal,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/Config";

const THEME = {
    primary: "#E87A90",
    bg: "#FEF6F8",
    surface: "#FFFFFF",
    textDark: "#2C2C2C",
    textGray: "#757575",
    textLight: "#A0A0A0",
    border: "#EAEAEA",
};

const shadows = {
    soft: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
};

export default function EditEventScreen() {
    const params = useLocalSearchParams();

    const [loading, setLoading] = useState(false);
    const [eventId, setEventId] = useState("");
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    // 🔥 State untuk Management Custom Modal Notifikasi
    const [modalInfo, setModalInfo] = useState({
        visible: false,
        type: "success", // "success" | "error"
        title: "",
        message: "",
        onClose: () => { },
    });

    // 🛠️ Helper Fungsi untuk Menampilkan Custom Modal
    const showModal = (
        type: "success" | "error",
        title: string,
        message: string,
        onCloseCallback?: () => void,
    ) => {
        setModalInfo({
            visible: true,
            type,
            title,
            message,
            onClose: () => {
                setModalInfo((prev) => ({ ...prev, visible: false }));
                if (onCloseCallback) onCloseCallback();
            },
        });
    };

    // 🔄 TANGKAP DATA JADWAL DARI ROUTER PARAMS
    useEffect(() => {
        if (params.event) {
            try {
                const parsedEvent = JSON.parse(params.event as string);
                setEventId(parsedEvent.id);
                setTitle(parsedEvent.title || "");

                // Sterilisasi format string datetime agar seragam ke kolom text input
                const formatTime = (timeStr: string) =>
                    timeStr ? timeStr.replace("T", " ").substring(0, 19) : "";

                setStart(formatTime(parsedEvent.start_time));
                setEnd(formatTime(parsedEvent.end_time));
            } catch (error) {
                console.error("Gagal memproses data event:", error);
                showModal("error", "Error Data", "Gagal membaca detail agenda.");
            }
        }
    }, [params.event]);

    // 🚀 REST API: KIRIM PERUBAHAN JADWAL KE SERVER PHP
    const handleUpdate = async () => {
        if (!title.trim() || !start.trim() || !end.trim()) {
            showModal("error", "Perhatian", "Semua kolom harus diisi brok!");
            return;
        }

        try {
            setLoading(true);
            let token =
                Platform.OS === "web"
                    ? localStorage.getItem("user_token")
                    : await AsyncStorage.getItem("user_token");

            const res = await fetch(`${API_URL.CALENDAR_EVENT}?id=${eventId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify({
                    title: title,
                    start: start,
                    end: end,
                }),
            });

            const result = await res.json();

            if (result.status === "success") {
                showModal(
                    "success",
                    "Berhasil!",
                    "Agenda kamu sudah diperbarui brok.",
                    () => {
                        router.back(); // Kick balik ke screen calendar setelah modal ditutup
                    },
                );
            } else {
                showModal(
                    "error",
                    "Gagal Update",
                    result.message || "Gagal mengupdate event",
                );
            }
        } catch (error) {
            console.error("Error update event:", error);
            showModal(
                "error",
                "Koneksi Bermasalah",
                "Terjadi kesalahan koneksi ke server",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />

            {/* HEADER AREA */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-left" size={24} color={THEME.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Agenda</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* TOP BANNER */}
                    <View style={styles.bannerContainer}>
                        <View style={styles.iconBgBig}>
                            <Feather name="edit-3" size={48} color={THEME.primary} />
                        </View>
                        <Text style={styles.bannerText}>Sesuaikan Rencanamu</Text>
                    </View>

                    {/* INPUT FORM CARD */}
                    <View style={styles.formCard}>
                        {/* INPUT: NAMA AGENDA */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Agenda</Text>
                            <View style={styles.inputWrapper}>
                                <Feather
                                    name="type"
                                    size={20}
                                    color={THEME.textLight}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Contoh: Meeting Kerja Praktek"
                                    placeholderTextColor="#CCC"
                                />
                            </View>
                        </View>

                        {/* INPUT: WAKTU MULAI */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Waktu Mulai (YYYY-MM-DD HH:MM:SS)
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Feather
                                    name="calendar"
                                    size={20}
                                    color={THEME.textLight}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={start}
                                    onChangeText={setStart}
                                    placeholder="2026-07-05 14:00:00"
                                    placeholderTextColor="#CCC"
                                />
                            </View>
                        </View>

                        {/* INPUT: WAKTU SELESAI */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Waktu Selesai (YYYY-MM-DD HH:MM:SS)
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Feather
                                    name="clock"
                                    size={20}
                                    color={THEME.textLight}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={end}
                                    onChangeText={setEnd}
                                    placeholder="2026-07-05 15:30:00"
                                    placeholderTextColor="#CCC"
                                />
                            </View>
                        </View>

                        {/* INFO FOOTER BOX */}
                        <View style={styles.infoBox}>
                            <MaterialCommunityIcons
                                name="information-outline"
                                size={16}
                                color={THEME.textGray}
                            />
                            <Text style={styles.infoText}>
                                Format waktu wajib menggunakan standar database SQL lokal WIB
                                (Tahun-Bulan-Tanggal Jam:Menit:Detik).
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ACTION BOTTOM BAR BUTTON */}
            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleUpdate}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Feather
                                name="check"
                                size={20}
                                color="#FFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* 🔥 CUSTOM NOTIFICATION MODAL (SUKSES / GAGAL) 🔥 */}
            <Modal
                transparent={true}
                visible={modalInfo.visible}
                animationType="fade"
                onRequestClose={modalInfo.onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View
                            style={[
                                styles.modalIconContainer,
                                {
                                    backgroundColor:
                                        modalInfo.type === "success" ? "#E8F5E9" : "#FFEBEE",
                                },
                            ]}
                        >
                            <Feather
                                name={
                                    modalInfo.type === "success" ? "check-circle" : "x-circle"
                                }
                                size={32}
                                color={modalInfo.type === "success" ? "#4CAF50" : "#F44336"}
                            />
                        </View>
                        <Text style={styles.modalTitle}>{modalInfo.title}</Text>
                        <Text style={styles.modalMessage}>{modalInfo.message}</Text>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: THEME.primary }]}
                            onPress={modalInfo.onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: THEME.surface,
        ...shadows.soft,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.bg,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.textDark,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    bannerContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconBgBig: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FCE4E8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    bannerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: THEME.textDark,
    },
    formCard: {
        backgroundColor: THEME.surface,
        borderRadius: 24,
        padding: 24,
        ...shadows.soft,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: THEME.textGray,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: 16,
        height: 54,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: THEME.textDark,
        fontWeight: "500",
        ...Platform.select({
            web: {
                outlineStyle: "none",
            },
        }),
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 4,
    },
    infoText: {
        fontSize: 12,
        color: THEME.textGray,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
    bottomAction: {
        backgroundColor: THEME.surface,
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...shadows.medium,
    },
    saveButton: {
        flexDirection: "row",
        backgroundColor: THEME.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    // STYLING CUSTOM POP-UP MODAL INFO
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
    modalIconContainer: {
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
    modalButton: {
        width: "100%",
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    modalButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },
});
