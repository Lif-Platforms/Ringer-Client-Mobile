import styles from "../../styles/messages/message";
import { View, Image, Text } from "react-native";
import getEnvVars from "../../variables";

export default function Message({ message, index }) {
    return (
        <View key={index} style={styles.message}>
            <Image
                source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${message.Author}.png` }}
                style={styles.message_avatar}
            />
            <View style={styles.message_text_container}>
                <Text style={styles.messages_author}>{message.Author}</Text>
                {message.Message_Type === "GIF" ? (
                    <>
                        <Image
                            source={{ uri: message.GIF_URL }}
                            style={styles.message_gif}
                        />
                        <Image
                            source={require("../../assets/messages/giphy_attrabution.png")}
                            style={styles.giphy_logo}
                        />
                    </>
                ) : (
                    <Text style={styles.messages_content} selectable={true}>{message.Message}</Text>
                )}
            </View>
        </View>
    )
}