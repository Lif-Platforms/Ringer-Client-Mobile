// Module imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import getEnvVars from "./variables";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Page imports
import { MainScreen } from './pages/main';
import { LoginScreen } from './pages/login';
import { MessagesPage } from "./pages/messages";
import { Notifications } from './pages/notifications'; 
import { AddFriendPage } from './pages/add_friend';
import { AccountPage } from './pages/account';
import { UserProfilePage } from './pages/user_profile';

// Import websocket provider
import { WebSocketProvider } from './scripts/websocket_handler';
import NotificationBadge from './components/global/notification';

// Create navigation stack instance
const Stack = createStackNavigator();

// Get values from secure storage
async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
      return result;
  } else {
      return null;
  }
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Default component for app
// Mainly responsible for structuring our routes
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  console.log("app starting")

  // Get auth credentials from secure storage
  async function get_credentials() {
    const username = await getValueFor("username");
    const token = await getValueFor("token");

    return {username: username, token: token};
  }

  // Authenticate with auth server
  useEffect(() => {
    async function authenticate() {
      const credentials = await get_credentials();

      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("token", credentials.token);

      fetch(`${getEnvVars.auth_url}/auth/verify_token`, {
        method: "POST",
        body: formData
      })
      .then((response) => {
        if (response.ok) {
          setInitialRoute('Main');
          setIsReady(true);
        } else {
          throw new Error("Request Failed! Status code: " + response.status);
        }
      })
      .catch((err) => {
        console.log(err);
        setInitialRoute('Login');
        setIsReady(true);
      })
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
      <WebSocketProvider>
          <NavigationContainer>
            <NotificationBadge />
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
                options={{ title: 'Add Friend', headerLeft: () => null}}
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
            </Stack.Navigator>
          </NavigationContainer>
      </WebSocketProvider>
    </GestureHandlerRootView>
  );
}
