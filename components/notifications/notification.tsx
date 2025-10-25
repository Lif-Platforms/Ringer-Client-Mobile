import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from '../../styles/notifications/notification';
import { useState } from 'react';
import { Alert } from "react-native";
import FastImage from 'react-native-fast-image';
import { useAuth } from '@providers/auth';

type NotificationPropsType = {
    id: string;
    name: string;
    remove_notification: (id: string) => void;
    message: string;
}

export default function Notification({
    id,
    name,
    remove_notification,
    message
}: NotificationPropsType) {
    const [isLoading, setIsLoading] = useState(false);
    const { username, token } = useAuth();

    async function handle_notification(request_id: string, task: "accept" | "deny") {
        if (!username || !token) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append("request_id", request_id);

        // Set path based on task
        const path = task === "accept" ? "accept_friend_request" : "deny_friend_request";

        fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/${path}`, {
            headers: {
                username: username,
                token: token
            },
            method: "POST",
            body: formData
        })
        .then((response) => {
            if (response.ok) {
                setIsLoading(false);
                Alert.alert("Success", `Friend request ${task === "accept" ? "accepted" : "denied"}!`);
                remove_notification(request_id);
            } else {
                throw new Error("Request failed! Status code: " + response.status)
            }
        })
        .catch(() => {
            setIsLoading(false);
            Alert.alert("Error", "Something Went Wrong!");
        })
    }

    return (
        <View style={styles.notification}>
            <View style={styles.top_container}>
                <View style={styles.text_container}>
                    <FastImage
                        resizeMode={FastImage.resizeMode.cover}
                        style={styles.avatar}
                        source={{
                            uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${name}.png`,
                            cache: FastImage.cacheControl.web,
                            priority: FastImage.priority.normal,
                        }}
                    />
                    <Text style={styles.username}>{name}</Text>
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
                            onPress={() => handle_notification(id, "accept")}
                        >
                            <Image style={styles.controls_icon} source={require("../../assets/notifications/accept_icon.png")} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.controls_button, {backgroundColor: "#C20000"}]} onPress={() => handle_notification(id, "deny")}>
                            <Image style={styles.controls_icon} source={require("../../assets/notifications/decline_icon.png")} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {message && <Text style={styles.notification_bottom_text}>{message}</Text>}
        </View>
    )
}