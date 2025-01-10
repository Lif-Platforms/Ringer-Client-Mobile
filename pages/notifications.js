import { View, Text, ScrollView } from "react-native";
import BottomNavBar from "../components/global/bottom_navbar";
import { useEffect, useState } from "react";
import styles from "../styles/notifications/style";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import Notification from "../components/notifications/notification";

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

    return (
        <View style={styles.page}>
            <View>
                <Text style={styles.header_text}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.requests_viewer}>
                {Array.isArray(friendRequests) & friendRequests.length > 0 ? (
                    friendRequests.map((request, key) => (
                        <Notification key={key} request={request} navigation={navigation} />
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