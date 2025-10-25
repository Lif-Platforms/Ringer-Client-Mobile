import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { useRouter } from "expo-router";
import { useUserData } from "@providers/user_data_provider";

export default function Friend({ 
    username, 
    lastMessageSent,
    conversationID,
}) {
    const [isOnline, setIsOnline] = useState(false);

    const router = useRouter();

    const { userData } = useUserData();

    function handle_messages_navigate(conversation_id) {
        router.push(`/conversations/${conversation_id}`);
    }

    // Update online status based on userData
    useEffect(() => {
        if (userData && Array.isArray(userData)) {
            const friend = userData.find(user => user.Username === username);
            if (friend) {
                setIsOnline(friend.Online);
            }
        }
    }, [userData, username]);

    return (
        <TouchableOpacity
            style={styles.friendItem}
            onPress={() => handle_messages_navigate(conversationID)}
        >
            <View>
                <FastImage
                    resizeMode={FastImage.resizeMode.cover}
                    source={{
                        uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png`,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.web,
                    }}
                    style={styles.friendImage}
                />
                <View style={[styles.status_indicator, {backgroundColor: isOnline ? 'lightgreen' : 'gray'}]} />
            </View>
            <View style={styles.friendTextContainer}>
                <Text style={styles.friendText}>{username}</Text>
                <Text numberOfLines={1} ellipsizeMode='tail' style={styles.lastMessageText}>{lastMessageSent}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#525252",
    },
    friendImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginRight: 10,
    },
    friendText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    noFriendsText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    status_indicator: {
        position: 'absolute',
        bottom: 0,
        right: 8,
        width: 15,
        height: 15,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#160900',
    },
    lastMessageText: {
        color: "#a0a0a0",
        fontSize: 20,
        overflow: 'hidden',
    },
    friendTextContainer: {
        flex: 1
    },
});