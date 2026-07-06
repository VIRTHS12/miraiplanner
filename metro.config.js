const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Trik Jitu: Blokir asset font .ttf bawaan vector-icons khusus saat build Web
if (
  process.env.EXPO_PUBLIC_PLATFORM === "web" ||
  process.argv.includes("--platform=web") ||
  process.argv.includes("web")
) {
  // Kita hapus ekstensi ttf dari assetExts khusus untuk web
  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "ttf",
  );
}

module.exports = config;
