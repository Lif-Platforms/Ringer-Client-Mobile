import styles from "../../styles/messages/message";
import { View, Image, Text, Linking } from "react-native";
import Hyperlink from "react-native-hyperlink";
import FastImage from "react-native-fast-image";
import { useEffect, useState } from "react";
import { useWebSocket } from "@scripts/websocket_handler";
import { useAuth } from "@providers/auth";
import { useConversationData } from "@scripts/conversation_data_provider";

const MessageText = ({ message, didSendMessage }) => {
    const stylesToUse = didSendMessage ? styles.messages_content_send : 
                        styles.messages_content_receive;

    const textStyles = didSendMessage ? {
        color: "black",
        textAlign: "left",
        flexShrink: 1,
    } : {
        color: "white",
        textAlign: "left",
        flexShrink: 1,
    }

    return (
        <View style={stylesToUse}>
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

    const didSendMessage = message.Author === username;

    return (
        <View key={index} style={[styles.message,
            didSendMessage ? { flexDirection: "row-reverse" } : { flexDirection: "row" }
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
                    <MessageText message={message.Message} didSendMessage={didSendMessage} />
                )}
            </View>
        </View>
    )
}