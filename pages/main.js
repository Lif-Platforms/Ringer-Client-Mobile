import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import styles from "../styles/main/style";
import BottomNavBar from "../global_components/bottom_navbar";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ =  await getValueFor("token");

        return { username: username_, token: token_ };
    }

    async function registerForPushNotificationsAsync() {
        let token;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      
        if (finalStatus !== 'granted') {
          return;
        }
      
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        })).data;
        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then( async (token) => {
            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Create request body
            const body = {
                "push-token": token
            }
        
            // Register for push notifications with Ringer Server
            fetch(`${getEnvVars.ringer_url}/register_push_notifications/mobile`, {
                method: "POST",
                headers: {
                    username: credentials.username,
                    token: credentials.token
                },
                body: JSON.stringify(body)
            })
            .then((response) => {
                if (response.ok) {
                    console.log("Push notifications registered successfully");
                } else {
                    throw new Error("Notifications registration failed with status code: " + response.status);
                }
            })
            .catch((err) => {
                console.error(err);
            })
        });
    }, []);

    return(
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>People</Text>
                <TouchableOpacity style={styles.add_button} onPress={() => navigation.push("Add Friend")}>
                    <Image source={require("../assets/main/add_button.png")} />
                </TouchableOpacity>
            </View>
            <FriendsList navigation={navigation} />
            <BottomNavBar navigation={navigation}/>
        </View>
    )
}