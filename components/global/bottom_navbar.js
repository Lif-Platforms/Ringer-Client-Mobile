import { View,  TouchableOpacity, Image } from "react-native";
import styles from "../../styles/components/bottom_nav/style";
import { useEffect, useState } from "react";
import getEnvVars from "../../variables";
import * as SecureStore from 'expo-secure-store';
import React from "react";

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

function BottomNavBar({ navigation }) {
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
            setAvatarURL(`${getEnvVars.auth_url}/profile/get_avatar/${credentials.username}.png`);
        }

        fetchAvatarURL();
    }, []);

    return (
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.replace("Main")}>
                <Image source={require("../../assets/bottom_nav/people_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace("Notifications")}>
                <Image source={require("../../assets/bottom_nav/notification_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace("Account")}>
                <Image style={styles.avatar} source={{uri: avatarURL}} />
            </TouchableOpacity>
        </View>
    )
}

export default BottomNavBar;