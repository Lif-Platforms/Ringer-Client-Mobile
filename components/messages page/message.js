import { View, Image, Text, Linking, StyleSheet } from "react-native";
import Hyperlink from "react-native-hyperlink";
import FastImage from "react-native-fast-image";
import { useEffect, useState } from "react";
import { useWebSocket } from "@scripts/websocket_handler";
import { useAuth } from "@providers/auth";
import { useConversationData } from "@scripts/conversation_data_provider";

const MessageText = ({ message, didSendMessage, isEmojiOnly }) => {
    const stylesToUse = didSendMessage ? styles.messages_content_send : 
                        styles.messages_content_receive;

    const textStyles = {
        color: didSendMessage ? "black" : "white",
        textAlign: "left",
        flexShrink: 1,
        fontSize: isEmojiOnly ? 50 : 16,
        lineHeight: isEmojiOnly ? 60 : 20,
        includeFontPadding: false,
        textAlignVertical: "center",
    }

    const overrideStyles = isEmojiOnly ? {
        backgroundColor: "transparent",
        padding: isEmojiOnly ? 0 : null,
    } : null;

    return (
        <View style={[stylesToUse, overrideStyles]}>
            <Hyperlink linkStyle={styles.message_link} onPress={(url) => Linking.openURL(url)}>
                <Text style={textStyles} selectable={true}>{message}</Text>
            </Hyperlink>
        </View>
    );
};

export default function Message({ message, index }) {
    const [messageViewed, setMessageViewed] = useState(message.Viewed || false);

    const { viewMessage } = useWebSocket();
    const { appState, username } = useAuth();
    const { conversationId } = useConversationData();

    // Mark message as viewed when app state is active
    useEffect(() => {
        if (appState === "active" && !messageViewed) {
            // Mark message as viewed
            setMessageViewed(true);
            viewMessage(conversationId.current, message.Message_Id);
        }
    }, [appState]);

    // Determine if the message was sent by the current user
    const didSendMessage = message.Author === username;

    // Check if the message is just 3 emojis or less
    let isEmojiOnly = false;
    // Only treat as emoji if all characters are emoji and none are emoji-like symbols (like #, *, etc.)
    if (
        message.Message_Type !== "GIF" &&
        [...message.Message].length <= 3 &&
        [...message.Message].every(char =>
            // Unicode property escapes for Emoji, but exclude #, *, 0-9, and keycap combining
            /\p{Emoji}/u.test(char) &&
            !/[#*0-9\u20E3]/.test(char)
        )
    ) {
        isEmojiOnly = true;
    }

    return (
        <View key={index} style={[styles.message,
            didSendMessage ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
        ]}>
            <FastImage
                resizeMode={FastImage.resizeMode.cover}
                source={{
                    uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${message.Author}.png`,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.web,
                }}
                style={styles.message_avatar}
            />
            <View style={styles.message_text_container}>
                {message.Message_Type === "GIF" ? (
                    <>
                        <FastImage
                            source={{
                                uri: message.GIF_URL,
                                priority: FastImage.priority.normal,
                                cache: FastImage.cacheControl.immutable,
                            }}
                            style={didSendMessage ? styles.message_gif_send : styles.message_gif_receive}
                        />
                        <Image
                            source={require("../../assets/messages/giphy_attrabution.png")}
                            style={didSendMessage ? styles.giphy_logo_send : styles.giphy_logo_receive}
                        />
                    </>
                ) : (
                    <MessageText
                        message={message.Message}
                        didSendMessage={didSendMessage}
                        isEmojiOnly={isEmojiOnly}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    message: {
        display: "flex",
        marginBottom: 30,
        gap: 10,
        flexShrink: 1
    },
    message_avatar: {
        width: 20,
        height: 20,
        objectFit: "cover",
        borderRadius: 25,
        marginTop: "auto"
    },
    messages_author: {
        color: "white",
        fontSize: 25,
    },
    message_text_container: {
        flex: 1,
        flexShrink: 1,
    },
    messages_content_receive: {
        flexShrink: 1,
        backgroundColor: "#2c2f33",
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 10,
        alignSelf: "flex-start",
        maxWidth: "80%",
    },
    messages_content_send: {
        flexShrink: 1,
        backgroundColor: "#ff9900",
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 3,
        padding: 10,
        alignSelf: "flex-end",
        maxWidth: "80%",
    },
    message_gif_send: {
        width: 300,
        height: 250,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: "flex-end",
    },
    message_gif_receive: {
        width: 300,
        height: 250,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: "flex-start",
    },
    giphy_logo_send: {
        width: 110,
        marginTop: 10,
        height: 15,
        alignSelf: "flex-end",
    },
    giphy_logo_receive: {
        width: 110,
        marginTop: 10,
        height: 15,
        alignSelf: "flex-start",
    },
    message_link: {
        color: "#00b3ff",
        textDecorationLine: "underline",
        textDecorationColor: "#00b3ff",
        textDecorationStyle: "solid",
    },
});