import { useConversationData } from "@scripts/conversation_data_provider";
import {
    ActivityIndicator,
    View,
    Image,
    StyleSheet,
    Text
} from "react-native"

type MessagesHeaderProps = {
    isLoadingMoreMessages: boolean
    showStartConversationHeader: boolean
}

export default function MessagesHeader({ 
    isLoadingMoreMessages,
    showStartConversationHeader,
}: MessagesHeaderProps) {
    if (isLoadingMoreMessages) {
        return (
            <ActivityIndicator
                color={"white"} 
                style={{ margin: 20}} 
            />
        );
    }

    const { conversationName } = useConversationData();

    const startConversationMessages = [
        "🚀 Liftoff! This is the start of your chat journey.",
        "✨ First sparkle in the thread — let's see where it shines.",
        "🎬 Scene one, take one… the conversation begins!",
        "🍿 Pop! You're at the beginning of this story.",
    ];

    const randomStartMessage = startConversationMessages[
        Math.floor(Math.random() * startConversationMessages.length)
    ];

    if (showStartConversationHeader && conversationName) {
        return (
            <View style={styles.header}>
                <Image source={{ 
                    uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/v1/get_avatar/${conversationName}.png` 
                }} style={styles.avatar} />
                <Text style={styles.username}>{conversationName}</Text>
                <Text style={styles.subText}>{randomStartMessage}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 100,
        borderColor: "white",
        borderWidth: 4
    },
    header: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        borderColor: "#646464",
        borderBottomWidth: 1,
        marginBottom: 20,
        paddingVertical: 20
    },
    username: {
        color: "white",
        fontSize: 30,
        textAlign: "center",
        marginTop: 10
    },
    subText: {
        color: "#ababab",
        fontSize: 15,
        textAlign: "center",
        marginTop: 10,
    }
})