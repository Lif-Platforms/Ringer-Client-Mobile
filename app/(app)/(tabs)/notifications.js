import { View, Text, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import styles from "@styles/notifications/style";
import { secureGet } from "@scripts/secure_storage";
import Notification from "@components/notifications/notification";

export default function Notifications() {
    const [friendRequests, setFriendRequests] = useState("Loading");

    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

    useEffect(() => {
        async function get_requests() {
            const credentials = await get_auth_credentials();

            const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/get_friend_requests`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            })

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setFriendRequests(data);
            } else {
                setFriendRequests("Error");
            }
        } 
        get_requests();
    }, []);
    
    function remove_notification(id) {
        setFriendRequests((prevRequests) => prevRequests.filter(request => request.Request_Id !== id));
    }

    return (
        <View style={styles.page}>
            <View>
                <Text style={styles.header_text}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.requests_viewer}>
                {Array.isArray(friendRequests) & friendRequests.length > 0 ? (
                    friendRequests.map((request, key) => (
                        <Notification 
                            key={key}
                            id={request.Request_Id}
                            name={request.Sender}
                            remove_notification={remove_notification}
                        />
                    ))
                ) : Array.isArray(friendRequests) & friendRequests.length === 0 ? (
                    <Text style={styles.info_text}>No Friend Requests At This Time</Text>
                ) : friendRequests === "Loading" ? (
                    <Text style={styles.info_text} >Loading...</Text>
                ) : (
                    <Text style={styles.info_text}>Error Loading Friend Requests</Text>
                )}
            </ScrollView>
        </View>
    )
}