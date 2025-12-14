import FastImage from "react-native-fast-image";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { useConversationData } from "@scripts/conversation_data_provider";
import { useUserData } from "@providers/user_data_provider";
import { useRouter } from "expo-router";
import SkeletonLoader from "@components/global/skeleton_loader";

export default function ConversationHeader() {
    const [isOnline, setIsOnline] = useState(false);

    const { conversationName, isLoading, showLoader } = useConversationData();
    const { userData } = useUserData();

    const router = useRouter();

    // Update online status based on user data
    useEffect(() => {
        if (!conversationName || !userData) return;
        const user = userData.find((user) => user.Username === conversationName);
        if (user) {
            setIsOnline(user.Online);
        }
    }, [userData, conversationName]);

    function handle_profile_navigation() {
        router.push(`/user_profile/${conversationName}`);
    }

    if (isLoading && showLoader) {
        return (
            <View style={styles.headerLoaderContainer}>
                <SkeletonLoader
                    width={50}
                    height={50}
                    borderRadius={100}
                />
                <SkeletonLoader
                    width={200}
                    height={30}
                    borderRadius={100}
                />
            </View>
        )
    }

    if (!conversationName) { return null; }

    return (
        <>
            <View>
                <FastImage
                    resizeMode={FastImage.resizeMode.cover}
                    source={{
                        uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${conversationName}.png`,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.web,
                    }}
                    style={styles.header_avatar}
                />
                <View style={[styles.status_indicator, {backgroundColor: isOnline ? 'lightgreen' : 'gray'}]} />
            </View>
            <TouchableOpacity style={styles.header_user_container} onPress={handle_profile_navigation}>
                <Text style={styles.conversation_user}>{conversationName}</Text>
                <Image style={styles.more_arrow} source={require("@assets/messages/more_arrow.png")} />
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create({
    conversation_user: {
        color: "white",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: 25
    },
    more_arrow: {
        marginTop: "auto",
        marginBottom: "auto",
        width: 20,
        height: 20,
        objectFit: "contain",
        marginLeft: 10
    },
    header_user_container: {
        marginBottom: "auto",
        marginTop: "auto",
        display: "flex",
        flexDirection: "row"
    },
    status_indicator: {
        position: 'absolute',
        bottom: 0,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#2E241D'
    },
    header_avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        marginLeft: 15
    },
    headerLoaderContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginLeft: 15,
    },
});