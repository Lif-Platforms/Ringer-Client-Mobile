import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from '../../styles/notifications/notification';
import { useState } from 'react';
import getEnvVars from '../../variables';
import * as SecureStore from 'expo-secure-store';

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}

export default function Notification({ request, navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    async function handle_notification(request, task) {
        setIsLoading(true);

        const credentials = await get_auth_credentials();

        const formData = new FormData();
        formData.append("user", request);

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
        })
    }

    return (
        <View style={styles.notification}>
            <View style={styles.text_container}>
                <Image
                    style={styles.avatar}
                    source={{uri: `${getEnvVars.auth_url}/profile/get_avatar/${request.name}.png`}}
                />
                <Text style={styles.username}>{request.name}</Text>
                <Text
                    lineBreakMode="tail"
                    style={styles.notification_text}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    sent you a friend request.
                </Text>
            </View>
            {isLoading ? (
                <ActivityIndicator style={styles.loader} size={"small"} />
            ) : (
                <View style={styles.controls}>
                    <TouchableOpacity 
                        style={[styles.controls_button, {backgroundColor: "#006F00"}]}
                        onPress={() => handle_notification(request.name, "accept")}
                    >
                        <Image style={styles.controls_icon} source={require("../../assets/notifications/accept_icon.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controls_button, {backgroundColor: "#C20000"}]} onPress={() => handle_notification(request.name, "deny")}>
                        <Image style={styles.controls_icon} source={require("../../assets/notifications/decline_icon.png")} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}