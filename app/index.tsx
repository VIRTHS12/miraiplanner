import { Redirect } from "expo-router";

export default function IndexPage() {
    // Otomatis melempar user ke layout tabs (atau rute manapun yang jadi beranda lu)
    return <Redirect href="/(tabs)" />;
}
