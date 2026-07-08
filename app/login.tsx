import React, { useEffect, useState, useLayoutEffect } from "react";
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
  useWindowDimensions,
} from "react-native";
import { X, Flower, LogIn } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../constants/Config";

let WebView: any = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  // Simpan token dari URL web ke state lokal, JANGAN mutate object params
  const [webAuthPayload, setWebAuthPayload] = useState<{
    token: string;
    user: string | null;
  } | null>(null);

  // Potong token dari address bar secepatnya (sebelum paint), simpan ke state
  useLayoutEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        setLoading(true);

        const backupToken = url.searchParams.get("token");
        const backupUser = url.searchParams.get("user");

        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState({}, document.title, url.pathname + url.search);

        if (backupToken) {
          setWebAuthPayload({ token: backupToken, user: backupUser });
        }
      }
    }
  }, []);

  // Proses token — baik dari query param native (params.token) maupun web (webAuthPayload)
  useEffect(() => {
    const handleToken = async () => {
      const token = (params.token as string) || webAuthPayload?.token;
      const userRaw = (params.user as string) || webAuthPayload?.user;

      if (!token) return;

      setLoading(true);
      const user = userRaw ? JSON.parse(userRaw) : null;

      if (Platform.OS === "web") {
        localStorage.setItem("user_token", token);
        if (user) localStorage.setItem("userData", JSON.stringify(user));
      } else {
        await AsyncStorage.setItem("user_token", token);
        if (user) await AsyncStorage.setItem("userData", JSON.stringify(user));
      }

      router.replace("/");
    };

    handleToken();
  }, [params.token, webAuthPayload]);

  const handleLogin = () => {
    setLoading(true);

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const returnTo = `${window.location.origin}/login`;
        window.location.href = `${API_URL.LOGIN_GOOGLE}?return_to=${encodeURIComponent(returnTo)}`;
      }
    } else {
      setShowWebView(true);
    }
  };

  const onMessageFromWebView = async (event: any) => {
    try {
      const responseData = JSON.parse(event.nativeEvent.data);
      if (responseData.status === "success" && responseData.data?.token) {
        setLoading(true);
        const token = responseData.data.token;
        const user = responseData.data.user;

        await AsyncStorage.setItem("user_token", token);
        if (user) await AsyncStorage.setItem("userData", JSON.stringify(user));

        setShowWebView(false);
        router.replace("/");
      }
    } catch (error) {
      setLoading(false);
      console.error("Gagal parsing data login dari backend:", error);
    }
  };

  if (showWebView && Platform.OS !== "web" && WebView) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowWebView(false)}>
          {/* ✅ Ganti MaterialCommunityIcons close -> X */}
          <X size={24} color="#333" />
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
          onLoadEnd={() => setLoading(false)}
          userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        />
      </SafeAreaView>
    );
  }

  if (loading && !showWebView) {
    return (
      <View style={[styles.loadingContainer, { width: width || "100%", height: height }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={["#FFFFFF", "#FEE4EA"]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color="#E87A90" />
          <Text style={styles.loadingText}>Menyiapkan akun Mirai Planner...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ width, height, backgroundColor: "#FEF6F8" }}>
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
                {/* ✅ Ganti MaterialCommunityIcons flower -> Flower */}
                <Flower size={48} color="#E87A90" />
              </View>
              <Text style={styles.titleText}>Mirai Planner</Text>
              <Text style={styles.subtitleText}>Smart Calendar AI Assistant</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.googleButton} onPress={handleLogin}>
                {/* ✅ Ganti Google Brand Icon ke LogIn SVG murni */}
                <LogIn size={24} color="#FFF" style={styles.icon} />
                <Text style={styles.buttonText}>Masuk dengan Google</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>Aman • Login via Google Secure OAuth</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 60,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
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
    shadowColor: "#E87A90",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    marginBottom: 40,
    alignItems: "center",
    width: "100%",
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#E87A90",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
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
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    backgroundColor: "#FFFFFF",
  },
  loadingInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    color: "#E87A90",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
