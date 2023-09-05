// Module imports
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Page imports
import { MainScreen } from './pages/main';
import { LoginScreen } from './pages/login';

// Create navigation stack instance
const Stack = createStackNavigator();

// Default component for app
// Mainly responsible for structuring our routes
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: 'Main Page' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login Page' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
