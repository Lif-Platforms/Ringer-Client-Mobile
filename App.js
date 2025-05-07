// Module imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import getEnvVars from "./variables";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotifierWrapper } from 'react-native-notifier';
import handle_startup from './scripts/handle_startup';

// Page imports
import { MainScreen } from './pages/main';
import { LoginScreen } from './pages/login';
import { MessagesPage } from "./pages/messages";
import { Notifications } from './pages/notifications'; 
import { AddFriendPage } from './pages/add_friend';
import { AccountPage } from './pages/account';
import { UserProfilePage } from './pages/user_profile';
import NotificationHandler from './components/global/notification_handler';
import NoInternet from './pages/no_internet';

// Import websocket provider
import { WebSocketProvider } from './scripts/websocket_handler';
import ReconnectBar from './components/global/reconnect_bar';
import { UserDataProvider } from './scripts/user_data_provider';

// Create navigation stack instance
const Stack = createStackNavigator();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Set the animation options.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

// Default component for app
// Mainly responsible for structuring our routes
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  // Authenticate with auth server
  useEffect(() => {
    async function authenticate() {
      // Run handle startup script
      const auth_status = await handle_startup();

      if (auth_status && auth_status === "auth_ok") {
        setInitialRoute('Main');
      } else if (auth_status && auth_status === "no_internet") {
        setInitialRoute('No Internet');
      } else {
        setInitialRoute('Login');
      }

      setIsReady(true);
    }
    authenticate();
  }, []);

  // Hide splash screen once app is ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Return 'null' if app is not ready
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <UserDataProvider>
      <WebSocketProvider>
        <NotifierWrapper>
          <NavigationContainer>
            <ReconnectBar />
            <NotificationHandler />
              <NotificationHandler />
              <Stack.Navigator 
                initialRouteName={initialRoute}
                screenOptions={{
                  headerMode: 'screen', // Keep the header static during transitions
                }}
              >
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ title: 'Login Page', animationEnabled: false }}
                />
                <Stack.Screen
                  name="Main"
                  component={MainScreen}
                  options={{ title: 'Main Page', animationEnabled: false }}
                />
                <Stack.Screen
                  name="Messages"
                  component={MessagesPage}
                  options={{ 
                    title: 'Messages Page', 
                    headerLeft: () => null,
                  }}
                />
                <Stack.Screen
                  name="Notifications"
                  component={Notifications}
                  options={{ title: 'Notifications', animationEnabled: false }}
                />
                <Stack.Screen
                  name="Add Friend"
                  component={AddFriendPage}
                  options={{ 
                    title: 'Add Friend', 
                    headerLeft: () => null,
                    gestureDirection: 'vertical',
                    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                  }}
                />
                <Stack.Screen
                  name="Account"
                  component={AccountPage}
                  options={{ title: 'Account', animationEnabled: false}}
                />
                <Stack.Screen
                  name='User Profile'
                  component={UserProfilePage}
                  options={{ title: 'User Profile', animationEnabled: true, headerLeft: () => null}}
                />
                <Stack.Screen
                  name='No Internet'
                  component={NoInternet}
                />
              </Stack.Navigator>
            </NavigationContainer>
        </NotifierWrapper>
      </WebSocketProvider>
      </UserDataProvider>
    </GestureHandlerRootView>
  );
}
