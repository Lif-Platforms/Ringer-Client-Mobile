import { Text, View, Image, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useEffect, useState } from "react";
import styles from "@styles/account/style";
import { useWebSocket } from "@scripts/websocket_handler";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useUserData } from "@scripts/user_data_provider";
import { secureGet, secureDelete } from "@scripts/secure_storage";
import { useRouter } from "expo-router";
import { useCache } from "@scripts/cache_provider";

export default function AccountPage() {
    const [username, setUsername] = useState("");
    const [userPronouns, setUserPronouns] = useState();
    const [userBio, setUserBio] = useState();
    const { setUserData } = useUserData();

    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

    const router = useRouter();

    const websocket = useWebSocket();

    const { clearCache } = useCache();

    useEffect(() => {
        async function get_username() {
            const credentials = await get_auth_credentials();

            setUsername(credentials.username);
        }
        get_username();
    }, []);

    useEffect(() => {
        async function get_pronouns() {
            const response = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_pronouns/${username}`)

            if (response.ok) {
                const pronouns = (await response.text()).slice(1, -1);

                setUserPronouns(pronouns);
            }
        }
        get_pronouns();
    });

    useEffect(() => {
        async function get_bio() {
            const response = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_bio/${username}`)

            if (response.ok) {
                const bio = (await response.text()).slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '\r');

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
        await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/unregister_push_notifications/mobile`, {
            method: "POST",
            headers: {
                username: credentials.username,
                token: credentials.token
            },
            body: JSON.stringify({
                "push-token": push_token
            })
        })

        // Delete auth credentials from device
        await secureDelete("username");
        await secureDelete("token");

        // Clear user data from user data provider
        setUserData(null);

        // Clear cache
        clearCache();

        router.replace("/login");
    }

    return (
        <View style={styles.page}>
            <ScrollView>
            <View>
                <Image style={styles.user_banner} source={{uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_banner/${username}.png`}} onError={(err) => console.error(err)}/>
                <Image style={styles.user_avatar} source={{uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png`}} onError={(err) => console.error(err)}/>
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
        </View> 
    );
}