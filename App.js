// Module imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Page imports
import { MainScreen } from './pages/main';
import { LoginScreen } from './pages/login';
import { MessagesPage } from "./pages/messages";
import { Notifications } from './pages/notifications'; 
import { AddFriendPage } from './pages/add_friend';
import { AccountPage } from './pages/account';
import { SplashScreenComponent } from './pages/splash';

// Import websocket provider
import { WebSocketProvider } from './scripts/websocket_handler';

// Create navigation stack instance
const Stack = createStackNavigator();

// Default component for app
// Mainly responsible for structuring our routes
export default function App() {
  return (
    <WebSocketProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerMode: 'screen', // Keep the header static during transitions
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreenComponent} 
          />
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
        </Stack.Navigator>
      </NavigationContainer>
    </WebSocketProvider>
  );
}
