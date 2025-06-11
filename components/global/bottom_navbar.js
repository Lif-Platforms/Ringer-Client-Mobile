import { View, Image } from "react-native";
import styles from "../../styles/components/bottom_nav/style";
import { useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import React from "react";
import { Link } from "expo-router";

/**
 * Gets value from secure storage.
 * 
 * @param {string} key - The key being accessed from secure storage.
 */
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

function BottomNavBar() {
    const [avatarURL, setAvatarURL] = useState(null);

    /**
     * Get auth credentials from secure storage.
     */
    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    // Set avatar URL
    useEffect(() => {
        /**
        * Get the avatar URL using the secure storage credentials.
        */
        async function fetchAvatarURL() {
            const credentials = await get_auth_credentials();
            setAvatarURL(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${credentials.username}.png`);
        }

        fetchAvatarURL();
    }, []);

    return (
        <View style={styles.navbar}>
            <Link href="/(tabs)">
                <Image source={require("@assets/bottom_nav/messages_icon.png")} />
            </Link>
            <Link href="/(tabs)/notifications">
                <Image source={require("@assets/bottom_nav/notifications_icon.png")} />
            </Link>
            <Link href="/(tabs)/account">
                <Image style={styles.avatar} source={{uri: avatarURL}} />
            </Link>
        </View>
    )
}

export default BottomNavBar;