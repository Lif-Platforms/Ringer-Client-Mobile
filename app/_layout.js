import { AuthProvider } from "@scripts/auth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

Sentry.init({
  dsn: 'https://0d802587ad5dda365997ef1ede010d37@o4507181227769856.ingest.us.sentry.io/4509296049651712',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default function AppLayout() {
    // Prevent the splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync();
    
    // Set the animation options.
    SplashScreen.setOptions({
        duration: 400,
        fade: true,
    });

    return (
        <GestureHandlerRootView>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="(app)" options={{
                        headerShown: false,
                        animation: "fade",
                        animationDuration: 200,
                    }} />
                    <Stack.Screen name="login" options={{ 
                        headerShown: false,
                        animation: "fade",
                        animationDuration: 200,
                    }} />
                    <Stack.Screen name="create_account" options={{
                        presentation: "modal",
                        title: "Create Account",
                        headerShown: true,
                        headerBackTitleVisible: true,
                    }} />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}