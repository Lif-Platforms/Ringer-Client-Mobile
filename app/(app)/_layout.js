import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@scripts/auth";
import { Redirect, Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { WebSocketProvider } from "@scripts/websocket_handler";
import { UserDataProvider } from "@scripts/user_data_provider";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

    async function registerForPushNotificationsAsync() {
        let token;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      
        if (finalStatus !== 'granted') {
          return;
        }
      
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        })).data;
        return token;
    }

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        registerForPushNotificationsAsync().then( async (token) => {
            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Create request body
            const body = {
                "push-token": token
            }
        
            // Register for push notifications with Ringer Server
            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/register_push_notifications/mobile`, {
                method: "POST",
                headers: {
                    username: credentials.username,
                    token: credentials.token
                },
                body: JSON.stringify(body)
            })
            .then((response) => {
                if (response.ok) {
                    console.log("Push notifications registered successfully");
                } else {
                    throw new Error("Notifications registration failed with status code: " + response.status);
                }
            })
            .catch((err) => {
                console.error(err);
            })
        });
    }, [isAuthenticated, isLoading]);

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
                        <Stack.Screen name="add_friend" options={{
                            presentation: "modal",
                            headerShown: false,
                        }} />
                    </Stack>
                </WebSocketProvider>
            </UserDataProvider>
        );
    }
}
