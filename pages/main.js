import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import styles from "../styles/main/style";
import BottomNavBar from "../global_components/bottom_navbar";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

function FriendsList({ navigation }) {
    const [friends, setFriends] = useState([]);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    // Fetch friends list from server
    useEffect(() => {
        async function fetchFriends() {
            try {
                // Get env vars
                const ringer_url = getEnvVars.ringer_url;

                // Get auth credentials
                const credentials = await get_auth_credentials();

                const response = await fetch(`${ringer_url}/get_friends`, {
                    headers: {
                        username: credentials.username,
                        token: credentials.token
                    },
                    method: "GET"
                });

                if (response.ok) {
                    const data = await response.json();
                    setFriends(data);
                } else {
                    throw new Error("Request Failed! Status Code: " + response.status);
                }
            } catch (error) {
                console.error(error);
            }
        }

        fetchFriends();
    }, []);

    function handle_messages_navigate(username, conversation_id) {
        navigation.push('Messages', {
            username: username,
            conversation_id: conversation_id
        })
    }

    return (
        <ScrollView contentContainerStyle={styles.friends_container}>
            {friends.length > 0 ? (
                friends.map((friend, index) => (
                    <TouchableOpacity key={index} style={styles.friendItem} onPress={() => handle_messages_navigate(friend.Username, friend.Id)}>
                        <Image
                            source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${friend.Username}.png` }}
                            style={styles.friendImage}
                        />
                        <Text style={styles.friendText}>{friend.Username}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.noFriendsText}>No Friends Found</Text>
            )}
        </ScrollView>
    );
}

export function MainScreen({ navigation }) {
    const { connectWebSocket } = useWebSocket();

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
        console.log("Connecting to websocket")
        connectWebSocket(); // Connect WebSocket when HomeScreen mounts
    }, []);

    return(
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>People</Text>
                <TouchableOpacity style={styles.add_button}>
                    <Image source={require("../assets/main/add_button.png")} />
                </TouchableOpacity>
            </View>
            <FriendsList navigation={navigation} />
            <BottomNavBar navigation={navigation}/>
        </View>
    )
}