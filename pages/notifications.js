import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import BottomNavBar from "../global_components/bottom_navbar";
import { useEffect, useState } from "react";
import styles from "../styles/notifications/style";
import getEnvVars from "../variables";
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

export function Notifications({ navigation }) {
    const [friendRequests, setFriendRequests] = useState("Loading");
    const [isLoading, setIsLoading] = useState(false);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

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

    useEffect(() => {
        async function get_requests() {
            const credentials = await get_auth_credentials();

            const response = await fetch(`${getEnvVars.ringer_url}/get_friend_requests`, {
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
        <View style={styles.page}>
            <View>
                <Text style={styles.header_text}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.requests_viewer}>
                {Array.isArray(friendRequests) & friendRequests.length > 0 ? (
                    friendRequests.map((request, key) => (
                        <View key={key} style={styles.request}>
                            <Text style={styles.request_text}>{request.name}</Text>
                            {isLoading ? (
                                <Text style={styles.notifications_loader}>Loading...</Text>
                            ) : (
                                <View style={styles.request_controls}>
                                    <TouchableOpacity style={styles.request_controls_button} onPress={() => handle_notification(request.name, "accept")}>
                                        <Image style={styles.request_controls_image} source={require("../assets/notifications/accept_icon.png")} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.request_controls_button} onPress={() => handle_notification(request.name, "deny")}>
                                        <Image style={styles.request_controls_image} source={require("../assets/notifications/decline_icon.png")} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            
                        </View>
                    ))
                ) : Array.isArray(friendRequests) & friendRequests.length === 0 ? (
                    <Text style={styles.info_text}>No Friend Requests At This Time</Text>
                ) : friendRequests === "Loading" ? (
                    <Text style={styles.info_text} >Loading...</Text>
                ) : (
                    <Text style={styles.info_text}>Error Loading Friend Requests</Text>
                )}
            </ScrollView>
            <BottomNavBar navigation={navigation} />
        </View>
    )
}