import { Text, View, Image, ScrollView, TouchableOpacity, Linking } from "react-native";
import { cloneElement, useEffect, useState } from "react";
import styles from "../styles/account/style";
import BottomNavBar from "../global_components/bottom_navbar";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import * as Notifications from 'expo-notifications';
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

export function AccountPage({ navigation }) {
    const [username, setUsername] = useState("");
    const [userPronouns, setUserPronouns] = useState();
    const [userBio, setUserBio] = useState();

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    const websocket = useWebSocket();

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
        async function get_username() {
            const credentials = await get_auth_credentials();

            setUsername(credentials.username);
        }
        get_username();
    }, []);

    useEffect(() => {
        async function get_pronouns() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_pronouns/${username}`)

            if (response.ok) {
                const pronouns = (await response.text()).slice(1, -1);

                setUserPronouns(pronouns);
            }
        }
        get_pronouns();
    });

    useEffect(() => {
        async function get_bio() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_bio/${username}`)

            if (response.ok) {
                const bio = (await response.text()).slice(1, -1);

                setUserBio(bio);
            }
        }
        get_bio();
    });

    async function handle_logout() {
        // Close Websocket connection
        websocket.closeConnection();

        // Get auth credentials
        const credentials = await get_auth_credentials();

        async function get_expo_push_token() {
            try {
                const push_token = (await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig.extra.eas.projectId,
                })).data;

                return push_token;
            } catch {
                const push_token = "";
                return push_token;
            }
        }
        
        // Get expo push token
        const push_token = await get_expo_push_token();

        // Unregister device for push notifications
        await fetch(`${getEnvVars.ringer_url}/unregister_push_notifications/mobile`, {
            method: "POST",
            headers: {
                username: credentials.username,
                token: credentials.token
            },
            body: JSON.stringify({
                "push-token": push_token
            })
        })

        await SecureStore.deleteItemAsync("username");
        await SecureStore.deleteItemAsync("token");

        navigation.replace("Login");
    }

    return (
        <View style={styles.page}>
            <ScrollView>
            <View>
                <Image style={styles.user_banner} source={{uri: `${getEnvVars.auth_url}/profile/get_banner/${username}.png?timestamp=${new Date().getTime()}`}} onError={(err) => console.error(err)}/>
                <Image style={styles.user_avatar} source={{uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png?timestamp=${new Date().getTime()}`}} onError={(err) => console.error(err)}/>
                <Text style={styles.header_text}>{username}</Text>
            </View>
            <View style={styles.account_buttons}>
                <TouchableOpacity 
                    style={styles.account_button}
                    onPress={() => Linking.openURL("https://my.lifplatforms.com")}
                >
                    <Text style={styles.account_button_text}>Manage Account</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.account_button}
                    onPress={handle_logout}
                >
                    <Text style={styles.account_button_text}>Log Out</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.user_info_section}>
                <Text style={styles.user_info_header}>Pronouns</Text>
                <Text style={styles.user_info}>{userPronouns}</Text>
                <Text style={styles.user_info_header}>Bio</Text>
                <Text style={styles.user_info}>{userBio}</Text>
            </View>
        </ScrollView>
        <BottomNavBar navigation={navigation} />
        </View> 
    );
}