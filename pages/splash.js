// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import getEnvVars from '../variables';

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }
}

async function authenticate() {
    console.log("authenticating...")
    const username = await getValueFor('username')
    const token = await getValueFor('token');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('token', token);
    
    const response = await fetch(`${getEnvVars.auth_url}/auth/verify_token`);

    if (response.ok) {
        console.log("authentication ok")
        return true;
    } else {
        console.log("authentication failed")
        return false;
    }
}

export function SplashScreenComponent({ navigation }) {
    useEffect(() => {
        async function checkAuth() {
            const isAuthenticated = await authenticate();
            if (isAuthenticated) {
                navigation.replace('Main');
            } else {
                navigation.replace('Login');
            }
            await SplashScreen.hideAsync(); // Hide the splash screen
        }
        checkAuth();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Hello World</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#160900',
        height: "100%"
    },
});
