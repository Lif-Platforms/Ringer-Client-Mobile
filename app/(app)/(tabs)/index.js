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
import { useCache } from "@scripts/cache_provider";
import FastImage from "react-native-fast-image";

function FriendsList({ userData, setUserData, setIsCacheData }) {
    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

    const router = useRouter();

    const { getUserCache, setUserCache } = useCache();

    // Fetch friends list from server
    useEffect(() => {
        async function fetchFriends() {
            // Check if user data is already loaded
            if (userData) { return; }

            // Get user cache
            const userCache = getUserCache();

            // If user cache exists, set user data from cache
            if (userCache) {
                setIsCacheData(true); // Indicate that data is being loaded from cache
                setUserData(userCache);
            }
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
                    let data = await response.json();
                    setIsCacheData(false); // Indicate that data is being loaded from server
                    setUserData(data);

                    // Create new list of users to cache
                    let cacheData = [...data];

                    // Remove presence data from cache
                    cacheData.forEach(user => {
                        delete user.Online;
                    });

                    // Set user cache
                    setUserCache(cacheData);
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
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                source={{
                                    uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${friend.Username}.png`,
                                    priority: FastImage.priority.normal,
                                    cache: FastImage.cacheControl.web,
                                }}
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
    const { userData, setUserData, setIsCacheData } = useUserData();

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
                setIsCacheData={setIsCacheData}
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