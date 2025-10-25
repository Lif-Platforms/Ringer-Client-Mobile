import {
    Text,
    View,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { useCache } from "@scripts/cache_provider";
import Friend from "./friend";
import { useUserData } from "@providers/user_data_provider";
import FriendLoading from "./friend_loading";
import { useAuth } from "@providers/auth";

export default function FriendsList() {
    const { getUserCache, setUserCache } = useCache();
    const { userData, setUserData, setIsCacheData } = useUserData();

    // Keep track of loading state
    const [isLoading, setIsLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(false); // Loader will not show unless there is no cache data

    const { username, token } = useAuth();

    async function fetchFriends() {
        // Check if user data is already loaded
        if (userData) { return; }
        if (!username || !token) return;

        // Get user cache
        const userCache = getUserCache();

        // If user cache exists, set user data from cache
        if (userCache) {
            setUserData(userCache);
            setIsCacheData(true); // Indicate that data is being loaded from cache
            setIsLoading(false);
        } else {
            // If no cache data, show loader
            setShowLoader(true);
        }
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/get_friends`, {
                headers: {
                    username: username,
                    token: token
                },
                method: "GET"
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setIsCacheData(false); // Indicate that data is being loaded from server
                setIsLoading(false);

                // Create new list of users to cache,
                // and remove certain keys from the data
                let cacheData = data.map(user => {
                    const { Online, Unread_Messages, ...rest } = user;
                    return { ...rest };
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

    // Fetch friends list from server
    useEffect(() => {
        fetchFriends();
    }, []);

    if (isLoading && showLoader) {
        // Create a list of numbers to map the skeleton loader
        const skeletonCount = Array.from({ length: 10 }, (_, i) => i + 1);

        return (
            <View style={styles.friends_container}>
                {skeletonCount.map((_, index) => (
                    <FriendLoading key={index} />
                ))}
            </View>
        )
    } else if (isLoading && !showLoader) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={styles.friends_container}>
            {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((friend, index) => (
                    <Friend
                        key={index}
                        username={friend.Username}
                        lastMessageSent={friend.Last_Message}
                        conversationID={friend.Id}
                    />
                ))
            ) : (
                <Text style={styles.noFriendsText}>No Friends Found</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    friends_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
})