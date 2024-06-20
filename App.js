// Module imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Page imports
import { MainScreen } from './pages/main';
import { LoginScreen } from './pages/login';
import { MessagesPage } from "./pages/messages";
import { Notifications } from './pages/notifications';

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
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login Page' }}
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
        </Stack.Navigator>
      </NavigationContainer>
    </WebSocketProvider>
  );
}
