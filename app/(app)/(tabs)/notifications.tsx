import { View, Text, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import styles from "@styles/notifications/style";
import { useAuth } from "@providers/auth";
import { NotificationType } from "../../../types";
import NotificationList from "@components/notifications/notificationList";

export default function Notifications() {
    const [friendRequests, setFriendRequests] = useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [encounteredError, setEncounteredError] = useState<boolean>(false);
    const { username, token } = useAuth();

    useEffect(() => {
        async function get_requests() {
            if (!username || !token) return;
            const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/get_friend_requests`, {
                headers: {
                    username: username,
                    token: token
                }
            })

            if (response.ok) {
                const data = await response.json();
                setFriendRequests(data);
                setIsLoading(false);
            } else {
                setEncounteredError(true);
                setIsLoading(false);
            }
        } 
        get_requests();
    }, []);
    
    function remove_notification(id: string) {
        setFriendRequests((prevRequests) => prevRequests.filter(
            request => request.Request_Id !== id
        ));
    }

    return (
        <View style={styles.page}>
            <View>
                <Text style={styles.header_text}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.requests_viewer}>
                <NotificationList
                    notifications={friendRequests}
                    isLoading={isLoading}
                    encounteredError={encounteredError}
                    remove_notification={remove_notification}
                />
            </ScrollView>
        </View>
    )
}