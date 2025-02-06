import styles from "../../styles/notifications/notification";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import getEnvVars from '../../variables';
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}

export default function Notification({ id, name, navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    async function handle_notification(request_id, task) {
        setIsLoading(true);

        const credentials = await get_auth_credentials();

        const formData = new FormData();
        formData.append("request_id", request_id);

        // Set path based on task
        const path = task === "accept" ? "accept_friend_request" : "deny_friend_request";

        fetch(`${getEnvVars.ringer_url}/${path}`, {
            headers: {
                username: credentials.username,
                token: credentials.token
            },
            method: "POST",
            body: formData
        })
        .then((response) => {
            if (response.ok) {
                // Reloads the page
                navigation.replace("Notifications");
            } else {
                throw new Error("Request failed! Status code: " + response.status)
            }
        })
        .catch((error) => {
            console.error(error);
            setIsLoading(false);
            Alert.alert("Error", "Something Went Wrong!");
        })
    }

    return (
        <View style={styles.request}>
        <Text style={styles.request_text}>{name}</Text>
            {isLoading ? (
                <Text style={styles.notifications_loader}>Loading...</Text>
            ) : (
                <View style={styles.request_controls}>
                    <TouchableOpacity style={styles.request_controls_button} onPress={() => handle_notification(id, "accept")}>
                        <Image style={styles.request_controls_image} source={require("../../assets/notifications/accept_icon.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.request_controls_button} onPress={() => handle_notification(id, "deny")}>
                        <Image style={styles.request_controls_image} source={require("../../assets/notifications/decline_icon.png")} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}