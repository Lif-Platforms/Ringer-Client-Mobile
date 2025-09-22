import { useState, useEffect } from "react";
import { useAuth } from "@scripts/auth";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { WebSocketProvider } from "@scripts/websocket_handler";
import { UserDataProvider } from "@scripts/user_data_provider";
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, Platform, View, Text } from 'react-native';
import Constants from 'expo-constants';
import { ConversationDataProvider } from "@scripts/conversation_data_provider";
import { NotifierWrapper } from "react-native-notifier";
import ReconnectBar from "@components/global/reconnect_bar";
import { CacheProvider } from "@scripts/cache_provider";

export default function AppLayout() {
    // Get auth context
    const { isAuthenticated, verifyCredentials } = useAuth();

    // Determine if the app is loading
    const [isLoading, setIsLoading] = useState(true);

    // Determine if auth request failed due to connection issues
    const [noInternet, setNoInternet] = useState(false);

    // Verify credentials on app load
    useEffect(() => {
        if (isAuthenticated) { 
            setIsLoading(false);
            return;
        };
        
        const checkCredentials = async () => {
            try {
                await verifyCredentials();
            } catch (error) {
                // Detect if network request failed
                if (error.message === "TypeError: Network request failed") {
                    setNoInternet(true);
                }
            } finally {
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

    // Register for push notifications
    useEffect(() => {
        const registerForPushNotificationsAsync = async () => {
            if (isLoading || !isAuthenticated) return; // Don't run if app is still loading or not authenticated
            //if (__DEV__) return; // Don't register for push notifications in development mode

            console.log("Registering for push notifications");
            try {
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
                    console.warn("Push notification permissions not granted.");
                    return;
                }

                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig.extra.eas.projectId,
                })).data;

                // Get auth credentials
                const credentials = await get_auth_credentials();

                // Register for push notifications with Ringer Server
                const body = { "push-token": token };
                const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/register_push_notifications/mobile`, {
                    method: "POST",
                    headers: {
                        username: credentials.username,
                        token: credentials.token,
                    },
                    body: JSON.stringify(body),
                });

                if (response.ok) {
                    console.log("Push notifications registered successfully");
                } else {
                    throw new Error("Notifications registration failed with status code: " + response.status);
                }
            } catch (err) {
                console.error("Error registering for push notifications:", err);
            }
        };

        registerForPushNotificationsAsync();
    }, [isAuthenticated, isLoading]);

    // Determine what to render
    let content;
    if (isLoading) {
        content = (
            <View style={{ flex: 1, backgroundColor: '#160900', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
                <Text style={{ color: '#ffffff', textAlign: 'center', marginBottom: 50 }}>Getting Ringer Ready...</Text>
            </View>
        );
    } else if (isAuthenticated) {
        content = (
            <NotifierWrapper>
                <CacheProvider>
                    <UserDataProvider>
                        <ConversationDataProvider>
                            <WebSocketProvider>
                                <ReconnectBar />
                                <Stack>
                                    <Stack.Screen name="conversations/[conversation_id]" options={{ headerShown: false }} />
                                    <Stack.Screen name="user_profile/[username]" options={{ headerShown: false }} />
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                                    <Stack.Screen name="add_friend" options={{ presentation: "modal", headerShown: false }} />
                                </Stack>
                            </WebSocketProvider>
                        </ConversationDataProvider>
                    </UserDataProvider>
                </CacheProvider>
            </NotifierWrapper>
        );
    } else if (!isAuthenticated && !noInternet) {
        content = <Redirect href="/login" />;
    } else {
        content = <Redirect href="/no_internet" />;
    }

    return content;
}
