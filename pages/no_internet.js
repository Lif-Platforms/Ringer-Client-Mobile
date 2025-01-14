import { View, Image, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import styles from "../styles/no_internet/style";
import React, { useState } from "react";
import { useEffect, useRef } from "react";
import handle_startup from "../scripts/handle_startup";

export default function NoInternet({ navigation }) {
    const [isRetrying, setIsRetrying] = useState(false);

    // Configure styles for header bar
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: '#160900',
                height: 55,
                shadowColor: 'transparent'
            }
        });    
    }, [navigation]);

    /**
     * Handle Retrying Startup Auth.
     */
    async function handle_retry() {
        setIsRetrying(true);

        const auth_status = await handle_startup();

        if (auth_status === "auth_ok") {
            navigation.replace("Main");
        } else if (auth_status === "return_login") {
            navigation.replace("Login");
        } else {
            setIsRetrying(false);
        }
    }

    return (
        <View style={styles.page}>
            <Image
                source={require(`../assets/no_internet/no_internet.png`)}
                style={styles.icon}
            />
            <Text style={styles.title}>We Can't Reach Ringer</Text>
            <Text style={styles.subtitle}>We are having trouble accessing the Ringer service. Make sure your device has internet.</Text>
            <TouchableOpacity onPress={handle_retry} style={styles.retry_button}>
                {isRetrying ? (
                    <ActivityIndicator size={'small'} color="#ffffff" />
                ) : (
                    <Text style={styles.retry_button_text}>Retry</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}