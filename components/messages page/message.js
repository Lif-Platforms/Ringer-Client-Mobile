import styles from "../../styles/messages/message";
import { View, Image, Text, Linking } from "react-native";
import Hyperlink from "react-native-hyperlink";
import FastImage from "react-native-fast-image";

const MessageText = ({ message }) => {
    return ( 
        <View style={styles.messages_content}> 
            <Hyperlink linkStyle={styles.message_link} onPress={(url) => Linking.openURL(url)} > 
                <Text style={styles.message_text} selectable={true}>{message}</Text> 
            </Hyperlink> 
        </View> 
    );
};

export default function Message({ message, index }) {
    return (
        <View key={index} style={styles.message}>
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
                <Text style={styles.messages_author}>{message.Author}</Text>
                {message.Message_Type === "GIF" ? (
                    <>
                        <FastImage
                            source={{
                                uri: message.GIF_URL,
                                priority: FastImage.priority.normal,
                                cache: FastImage.cacheControl.immutable,
                            }}
                            style={styles.message_gif}
                        />
                        <Image
                            source={require("../../assets/messages/giphy_attrabution.png")}
                            style={styles.giphy_logo}
                        />
                    </>
                ) : (
                    <MessageText message={message.Message} />
                )}
            </View>
        </View>
    )
}