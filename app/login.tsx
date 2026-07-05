import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    ActivityIndicator,
    Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../constants/Config";

// 📱 Import WebView secara dinamis agar tidak merusak build platform Web
let WebView: any = null;
if (Platform.OS !== "web") {
    WebView = require("react-native-webview").WebView;
}

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);

    const params = useLocalSearchParams();

    // 🔄 EFFECT 1: Tangkap token hasil redirect URL param (Khusus Web Browser)
    useEffect(() => {
        const handleToken = async () => {
            if (params.token) {
                const token = params.token as string;
                const user = params.user ? JSON.parse(params.user as string) : null;

                if (Platform.OS === "web") {
                    localStorage.setItem("user_token", token);
                    if (user) localStorage.setItem("userData", JSON.stringify(user));
                } else {
                    await AsyncStorage.setItem("user_token", token);
                    if (user)
                        await AsyncStorage.setItem("userData", JSON.stringify(user));
                }

                router.replace("/");
            }
        };

        handleToken();
    }, [params]);

    // 🔥 LOGIN CONTROLLER
    const handleLogin = () => {
        setLoading(true);

        if (Platform.OS === "web") {
            const returnTo = window.location.origin;
            // 🌐 Di Web: Langsung ganti href jendela browser aktif
            window.location.href = `${API_URL.LOGIN_GOOGLE}?return_to=${encodeURIComponent(returnTo)}`;
        } else {
            // 📱 Di HP: Aktifkan layar WebView internal, matikan loading spinner button
            setLoading(false);
            setShowWebView(true);
        }
    };

    // 🔄 EFFECT 2: Tangkap data JSON dari echo PHP backend (Khusus HP Mobile)
    const onMessageFromWebView = async (event: any) => {
        try {
            const responseData = JSON.parse(event.nativeEvent.data);
            if (responseData.status === "success" && responseData.data?.token) {
                const token = responseData.data.token;
                const user = responseData.data.user;

                await AsyncStorage.setItem("user_token", token);
                if (user) await AsyncStorage.setItem("userData", JSON.stringify(user));

                setShowWebView(false);
                router.replace("/");
            }
        } catch (error) {
            console.error("Gagal parsing data login dari backend:", error);
        }
    };

    // 📱 RENDERING LAYER WEBVIEW (Khusus Android / iOS)
    if (showWebView && Platform.OS !== "web" && WebView) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
                <StatusBar barStyle="dark-content" />
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowWebView(false)}
                >
                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                    <Text style={{ fontWeight: "600", marginLeft: 4 }}>Batal</Text>
                </TouchableOpacity>
                <WebView
                    source={{ uri: `${API_URL.LOGIN_GOOGLE}?return_to=mobile` }}
                    onMessage={onMessageFromWebView}
                    injectedJavaScript={`
                        const checkInterval = setInterval(() => {
                            if (document.body && document.body.innerText.includes('"status"')) {
                                window.ReactNativeWebView.postMessage(document.body.innerText);
                                clearInterval(checkInterval);
                            }
                        }, 500);
                    `}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                />
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={require("@/assets/images/fotobackground.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={["rgba(255,255,255,0.8)", "rgba(254,228,234,0.95)"]}
                style={StyleSheet.absoluteFillObject}
            >
                <SafeAreaView style={styles.container}>
                    <StatusBar barStyle="dark-content" translucent />

                    <View style={styles.brandContainer}>
                        <View style={styles.logoBg}>
                            <MaterialCommunityIcons name="flower" size={48} color="#E87A90" />
                        </View>
                        <Text style={styles.titleText}>Mirai Planner</Text>
                        <Text style={styles.subtitleText}>Smart Calendar AI Assistant</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.googleButton, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" style={styles.icon} />
                            ) : (
                                <MaterialCommunityIcons
                                    name="google"
                                    size={24}
                                    color="#FFF"
                                    style={styles.icon}
                                />
                            )}
                            <Text style={styles.buttonText}>
                                {loading ? "Mengalihkan..." : "Masuk dengan Google"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            Aman • Login via Google Secure OAuth
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    brandContainer: { alignItems: "center", marginTop: 80 },
    logoBg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
    },
    titleText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginTop: 24,
    },
    subtitleText: {
        fontSize: 14,
        color: "#757575",
        marginTop: 8,
    },
    buttonContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    googleButton: {
        flexDirection: "row",
        backgroundColor: "#E87A90",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: { marginRight: 12 },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    footerText: {
        fontSize: 11,
        color: "#A0A0A0",
        marginTop: 16,
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#F5F5F5",
    },
});
