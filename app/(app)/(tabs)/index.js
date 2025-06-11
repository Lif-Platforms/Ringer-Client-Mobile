import { 
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ScrollView,
    Pressable,
} from "react-native";
import { useEffect } from "react";
import styles from "@styles/main/style";
import { secureGet } from "@scripts/secure_storage";
import { useWebSocket } from "@scripts/websocket_handler";
import { useUserData } from "@scripts/user_data_provider";
import { useRouter } from "expo-router";

function FriendsList({ userData, setUserData }) {
    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

    const router = useRouter();

    // Fetch friends list from server
    useEffect(() => {
        async function fetchFriends() {
            try {
                // Get auth credentials
                const credentials = await get_auth_credentials();

                const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/get_friends`, {
                    headers: {
                        username: credentials.username,
                        token: credentials.token
                    },
                    method: "GET"
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    throw new Error("Request Failed! Status Code: " + response.status);
                }
            } catch (error) {
                console.error(error);
            }
        }

        fetchFriends();
    }, []);

    function handle_messages_navigate(conversation_id) {
        router.push(`/conversations/${conversation_id}`);
    }

    return (
        <ScrollView contentContainerStyle={styles.friends_container}>
            {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((friend, index) => (
                    <TouchableOpacity key={index} style={styles.friendItem} onPress={() => handle_messages_navigate(friend.Id)}>
                        <View>
                            <Image
                                source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${friend.Username}.png` }}
                                style={styles.friendImage}
                            />
                            <View style={[styles.status_indicator, {backgroundColor: friend.Online ? 'lightgreen' : 'gray'}]} />
                        </View>
                        <View style={styles.friendTextContainer}>
                            <Text style={styles.friendText}>{friend.Username}</Text>
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.lastMessageText}>{friend.Last_Message}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.noFriendsText}>No Friends Found</Text>
            )}
        </ScrollView>
    );
}

export default function MainScreen() {
    const { connectWebSocket } = useWebSocket();
    const { userData, setUserData } = useUserData();

    useEffect(() => {
        connectWebSocket(); // Connect WebSocket when HomeScreen mounts
    }, []);

    const router = useRouter();

    return(
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
            </View>
            <FriendsList 
                setUserData={setUserData}
                userData={userData}
            />
            <Pressable
                style={({ pressed }) => [styles.add_button, {
                    transform: [{ scale: pressed ? 0.85 : 1 }]
                }]}
                onPress={() => router.push("/add_friend")}
            >
                <Image style={styles.add_button_icon} source={require("@assets/main/add_button.png")} />
            </Pressable>
        </View>
    )
}