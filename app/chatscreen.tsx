import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Config";

const THEME = {
    primary: "#E87A90",
    primaryLight: "#FCE4E8",
    bg: "#FEF6F8",
    surface: "#FFFFFF",
    textDark: "#2C2C2C",
    textGray: "#757575",
    textLight: "#A0A0A0",
    border: "#F0F0F0",
};

const QUICK_ACTIONS = [
    { id: "1", icon: "calendar", label: "Buat Jadwal besok" },
    { id: "2", icon: "clock", label: "Ada jadwal apa hari ini?" },
];

interface MessageItem {
    role: "user" | "assistant";
    content: string;
    created_at?: string;
    event_data?: {
        title: string;
        start: string;
        end: string;
    } | null;
}

export default function ChatScreen() {
    const params = useLocalSearchParams();
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [sendLoading, setSendLoading] = useState(false);

    // 🔥 STATE UNTUK ATTACHMENT JADWAL
    const [attachedEvent, setAttachedEvent] = useState<any>(null);

    const scrollViewRef = useRef<ScrollView>(null);

    // Cek apakah ada lemparan event dari screen kalender
    useEffect(() => {
        if (params.attachedEvent) {
            try {
                const parsed = JSON.parse(params.attachedEvent as string);
                setAttachedEvent(parsed);
                // Trigger auto placeholder pesan biar user tinggal kirim
                setInputText(`Brok, coba tolong review jadwal "${parsed.title}" ini.`);
            } catch (e) {
                console.error("Gagal parse attached event", e);
            }
        }
    }, [params.attachedEvent]);

    // 📜 1. LOAD HISTORY CHAT
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            const loadChatHistory = async () => {
                try {
                    const token = await AsyncStorage.getItem("user_token");
                    if (!token) {
                        router.replace("/login");
                        return;
                    }

                    const response = await fetch(API_URL.CHAT_HISTORY, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "69420",
                        },
                    });
                    const json = await response.json();

                    if (isMounted && json.status === "success") {
                        setMessages(json.data || []);
                    }
                } catch (err) {
                    console.error("Gagal load history chat:", err);
                } finally {
                    if (isMounted) setHistoryLoading(false);
                }
            };

            loadChatHistory();
            return () => {
                isMounted = false;
            };
        }, []),
    );

    // 🤖 2. KIRIM PESAN KE AI + MEMBAWA ATTACHMENT
    const handleSendMessage = async (textToSend: string) => {
        const msgClean = textToSend.trim();
        if ((!msgClean && !attachedEvent) || sendLoading) return;

        setInputText("");
        setSendLoading(true);

        const currentAttachment = attachedEvent;
        // Reset attachment view sehabis klik kirim
        setAttachedEvent(null);
        router.setParams({ attachedEvent: undefined });

        // Ubah struktur data objek mengikuti standar key model backend (title, start, end)
        const eventPayload = currentAttachment
            ? {
                title: currentAttachment.title,
                start: currentAttachment.start_time,
                end: currentAttachment.end_time,
            }
            : null;

        const userTempMessage: MessageItem = {
            role: "user",
            content:
                msgClean || `[Mengirim Lampiran Jadwal: ${currentAttachment?.title}]`,
            created_at: new Date().toISOString(),
            event_data: eventPayload,
        };

        setMessages((prev) => [...prev, userTempMessage]);
        setTimeout(
            () => scrollViewRef.current?.scrollToEnd({ animated: true }),
            100,
        );

        try {
            const token = await AsyncStorage.getItem("user_token");
            const response = await fetch(API_URL.CHAT_SEND, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: msgClean,
                    attached_event: eventPayload,
                }),
            });

            const json = await response.json();

            // 🔥 SEKARANG LOGIKA SUKSES & CLASH (BENTROK) KITA JADIKAN SATU ALUR CHAT
            if (response.status === 200 && json.status === "success") {
                // Jika sukses membuat/mengubah jadwal
                const aiMessage: MessageItem = {
                    role: "assistant",
                    content:
                        json.message || `Berhasil memproses lampiran jadwal lu brok! ✅`,
                    created_at: new Date().toISOString(),
                    event_data: json.data?.event || null,
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else if (response.status === 409 || json.status === "error") {
                // 🔥 SUNTIK LANGSUNG KATA BENTROK KE BUBBLE CHAT AI TANPA POP-UP ALERT
                const aiClashMessage: MessageItem = {
                    role: "assistant",
                    content:
                        json.message ||
                        `Waduh brok, jadwalnya bentrok nih sama agenda lain. Coba cek lagi deh! 🛑`,
                    created_at: new Date().toISOString(),
                    event_data: null, // Jangan tampilin card schedule kalau gagal/bentrok
                };
                setMessages((prev) => [...prev, aiClashMessage]);
            } else {
                // Eror sistem fatal lainnya (misal token habis/server mati) baru boleh alert biasa
                alert(`❌ Gagal: ${json.message}`);
            }
        } catch (err) {
            alert("❌ Putus koneksi gateway server OpenClaw.");
        } finally {
            setSendLoading(false);
            setTimeout(
                () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                150,
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />

            {/* Header Panel */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerIcon}
                    activeOpacity={0.7}
                    onPress={() => router.replace("/")}
                >
                    <Feather name="chevron-left" size={24} color={THEME.textDark} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>
                        Mirai Planner{" "}
                        <MaterialCommunityIcons
                            name="flower"
                            size={16}
                            color={THEME.primary}
                        />
                    </Text>
                    <Text style={styles.headerSubtitle}>AI Assistant</Text>
                </View>

                <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
                    <Feather name="more-horizontal" size={24} color={THEME.textDark} />
                </TouchableOpacity>
            </View>

            {/* Chat Area Section */}
            {historyLoading ? (
                <View style={styles.centerIndicator}>
                    <ActivityIndicator size="large" color={THEME.primary} />
                    <Text style={styles.loadingText}>
                        Memuat riwayat pangkalan chat...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                    }
                >
                    {messages.length === 0 && (
                        <Text style={styles.chatWelcomeText}>
                            👋 Halo brok! Ketik agenda bebas lu di bawah, biar AI langsung
                            bikinin jadwalnya di Google Calendar otomatis!
                        </Text>
                    )}

                    {messages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        const timeString = msg.created_at
                            ? new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "";

                        return (
                            <View
                                key={index}
                                style={
                                    isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
                                }
                            >
                                {!isUser && (
                                    <View style={styles.aiAvatar}>
                                        <MaterialCommunityIcons
                                            name="flower"
                                            size={22}
                                            color={THEME.surface}
                                        />
                                    </View>
                                )}

                                <View style={isUser ? styles.userBubble : styles.aiBubble}>
                                    <Text style={styles.messageText}>{msg.content}</Text>

                                    {/* 📅 DIGITAL CARD ATTACHMENT (Berlaku untuk Bubble User maupun Bubble AI) */}
                                    {msg.event_data && (
                                        <View
                                            style={[
                                                styles.scheduleCard,
                                                { backgroundColor: isUser ? "#FFF" : "#FAFAFA" },
                                            ]}
                                        >
                                            <View style={styles.scheduleCardHeader}>
                                                <View style={styles.iconBox}>
                                                    <Feather
                                                        name="briefcase"
                                                        size={18}
                                                        color={THEME.primary}
                                                    />
                                                </View>
                                                <View style={styles.scheduleInfo}>
                                                    <Text style={styles.scheduleTitle} numberOfLines={1}>
                                                        {msg.event_data.title}
                                                    </Text>
                                                    <Text style={styles.scheduleTime}>
                                                        {msg.event_data.start
                                                            ? new Date(
                                                                msg.event_data.start.replace(" ", "T"),
                                                            ).toLocaleDateString("id-ID", {
                                                                weekday: "long",
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            })
                                                            : "Waktu tidak set"}
                                                    </Text>
                                                    <Text style={styles.scheduleTime}>
                                                        {msg.event_data.start
                                                            ? msg.event_data.start.substring(11, 16)
                                                            : "00:00"}{" "}
                                                        -{" "}
                                                        {msg.event_data.end
                                                            ? msg.event_data.end.substring(11, 16)
                                                            : "00:00"}{" "}
                                                        WIB
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.sourceTag}>
                                                <MaterialCommunityIcons
                                                    name="google"
                                                    size={14}
                                                    color="#DB4437"
                                                />
                                                <Text style={styles.sourceText}>Attached Agenda</Text>
                                            </View>
                                        </View>
                                    )}

                                    <View
                                        style={
                                            isUser ? styles.timestampRow : styles.timestampRowLeft
                                        }
                                    >
                                        <Text style={styles.timestampText}>{timeString}</Text>
                                        {isUser && (
                                            <MaterialCommunityIcons
                                                name="check-all"
                                                size={14}
                                                color={THEME.primary}
                                                style={styles.readIcon}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {sendLoading && (
                        <View style={styles.aiMessageWrapper}>
                            <View style={styles.aiAvatar}>
                                <MaterialCommunityIcons
                                    name="flower"
                                    size={22}
                                    color={THEME.surface}
                                />
                            </View>
                            <View style={[styles.aiBubble, styles.loadingBubble]}>
                                <ActivityIndicator size="small" color={THEME.primary} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Input Form Control */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardAvoidingView}
            >
                {/* 📎 PREVIEW ATTACHMENT BOX DI ATAS INPUT TEXT BAR */}
                {attachedEvent && (
                    <View style={styles.attachmentPreviewContainer}>
                        <View style={styles.attachmentPreviewCard}>
                            <MaterialCommunityIcons
                                name="paperclip"
                                size={20}
                                color={THEME.primary}
                            />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.attachmentPreviewTitle} numberOfLines={1}>
                                    Lampiran: {attachedEvent.title}
                                </Text>
                                <Text style={styles.attachmentPreviewSub}>
                                    {attachedEvent.start_time?.substring(0, 16)} WIB
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setAttachedEvent(null);
                                    router.setParams({ attachedEvent: undefined });
                                }}
                                style={{ padding: 4 }}
                            >
                                <Feather name="x-circle" size={18} color={THEME.textGray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.inputSection}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={
                                attachedEvent
                                    ? "Tambahkan pesan review..."
                                    : "Ketik instruksi jadwal..."
                            }
                            placeholderTextColor={THEME.textLight}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            disabled={sendLoading}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                ((!inputText.trim() && !attachedEvent) || sendLoading) &&
                                styles.sendButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleSendMessage(inputText)}
                            disabled={(!inputText.trim() && !attachedEvent) || sendLoading}
                        >
                            <MaterialCommunityIcons
                                name="send"
                                size={18}
                                color={THEME.surface}
                                style={styles.sendIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsContainer}
                    >
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.chip}
                                activeOpacity={0.6}
                                onPress={() => !sendLoading && handleSendMessage(action.label)}
                                disabled={sendLoading}
                            >
                                <Feather
                                    name={action.icon as any}
                                    size={14}
                                    color={THEME.primary}
                                />
                                <Text style={styles.chipText}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const shadows = {
    soft: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    medium: {
        shadowColor: "#E87A90",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    centerIndicator: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: {
        color: THEME.textGray,
        marginTop: 10,
        fontSize: 13,
        fontWeight: "600",
    },
    chatWelcomeText: {
        textAlign: "center",
        padding: 20,
        color: THEME.textGray,
        fontSize: 13,
        fontStyle: "italic",
        lineHeight: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: THEME.surface,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        ...shadows.soft,
        zIndex: 10,
    },
    headerIcon: { padding: 8, borderRadius: 20 },
    headerTitleContainer: { alignItems: "center" },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: THEME.textDark,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: THEME.textGray,
        marginTop: 2,
        fontWeight: "500",
    },
    chatContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
    userMessageWrapper: { alignItems: "flex-end", marginBottom: 20 },
    userBubble: {
        backgroundColor: THEME.primaryLight,
        padding: 14,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        maxWidth: "85%",
    },
    messageText: { fontSize: 15, color: THEME.textDark, lineHeight: 22 },
    timestampRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 6,
    },
    timestampRowLeft: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 6,
    },
    timestampText: { fontSize: 11, color: THEME.textGray, fontWeight: "500" },
    readIcon: { marginLeft: 4 },
    aiMessageWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 20,
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: THEME.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginBottom: 4,
        ...shadows.medium,
    },
    aiBubble: {
        backgroundColor: THEME.surface,
        padding: 14,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        maxWidth: "80%",
        ...shadows.soft,
    },
    loadingBubble: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    scheduleCard: {
        backgroundColor: "#FAFAFA",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: THEME.border,
        marginTop: 12,
        width: "100%",
    },
    scheduleCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: THEME.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    scheduleInfo: { flex: 1 },
    scheduleTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: THEME.textDark,
        marginBottom: 4,
    },
    scheduleTime: {
        fontSize: 12,
        color: THEME.textGray,
        marginBottom: 2,
        fontWeight: "500",
    },
    sourceTag: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: THEME.border,
    },
    sourceText: {
        fontSize: 11,
        color: THEME.textGray,
        marginLeft: 6,
        fontWeight: "600",
    },
    keyboardAvoidingView: { backgroundColor: THEME.surface },
    inputSection: {
        backgroundColor: THEME.surface,
        borderTopWidth: 1,
        borderTopColor: THEME.border,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        color: THEME.textDark,
        marginRight: 10,
        minHeight: 45,
        maxHeight: 100,
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: THEME.primary,
        justifyContent: "center",
        alignItems: "center",
        ...shadows.medium,
    },
    sendButtonDisabled: {
        backgroundColor: "#D3D3D3",
        shadowOpacity: 0,
        elevation: 0,
    },
    sendIcon: {
        transform: [{ rotate: "-45deg" }, { translateX: 2 }, { translateY: -2 }],
    },
    chipsContainer: { paddingHorizontal: 16, paddingBottom: 4 },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.surface,
        borderWidth: 1,
        borderColor: THEME.primaryLight,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 10,
    },
    chipText: {
        fontSize: 13,
        color: THEME.textDark,
        marginLeft: 6,
        fontWeight: "600",
    },

    // 📎 STYLE BARU UNTUK ATTACHMENT PREVIEW BOX
    attachmentPreviewContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: THEME.surface,
    },
    attachmentPreviewCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME.bg,
        borderWidth: 1,
        borderColor: THEME.primaryLight,
        borderRadius: 14,
        padding: 10,
    },
    attachmentPreviewTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: THEME.textDark,
    },
    attachmentPreviewSub: {
        fontSize: 12,
        color: THEME.textGray,
        marginTop: 2,
    },
});
