import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@scripts/auth";
import { Redirect, Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { WebSocketProvider } from "@scripts/websocket_handler";
import { UserDataProvider } from "@scripts/user_data_provider";

export default function AppLayout() {
    //  Get auth context
    const { isAuthenticated, verifyCredentials } = useContext(AuthContext);

    // Determine if the app is loading
    const [isLoading, setIsLoading] = useState(true);

    // Verify credentials on app load
    useEffect(() => {
        const checkCredentials = async () => {
            try {
                await verifyCredentials();
                setIsLoading(false);
            } catch (error) {
                console.error("Error verifying credentials:", error);
                setIsLoading(false);
            }
        };

        checkCredentials();
    }, []);

    // Hide the splash screen after loading
    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    // If app is done loading but not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
        return <Redirect href="/login" />;
    }

    // If app is done loading and authenticated, show the main app
    if (!isLoading && isAuthenticated) {
        return (
            <UserDataProvider>
                <WebSocketProvider>
                    <Stack>
                        <Stack.Screen name="conversations/[conversation_id]" options={{
                            headerShown: false,   
                        }} />
                        <Stack.Screen name="user_profile/[username]" options={{
                            headerShown: false,
                        }} />
                        <Stack.Screen name="(tabs)" options={{
                            headerShown: false,
                            animation: "none",
                        }} />
                    </Stack>
                </WebSocketProvider>
            </UserDataProvider>
        );
    }
}
