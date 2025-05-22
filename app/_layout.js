import { AuthProvider } from "@scripts/auth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

export default function AppLayout() {
    // Prevent the splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync();
    
    // Set the animation options.
    SplashScreen.setOptions({
        duration: 400,
        fade: true,
    });

    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(app)" options={{
                    headerShown: false,
                    animation: "none",
                }} />
                <Stack.Screen name="login" options={{ headerShown: false, animation: "none" }} />
                <Stack.Screen name="create_account" options={{
                    presentation: "modal",
                    title: "Create Account",
                    headerShown: true,
                    headerBackTitleVisible: true,
                }} />
            </Stack>
        </AuthProvider>
    );
}