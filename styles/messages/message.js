import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    message: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 30,
        gap: 10,
        flexShrink: 1,
        borderRadius: 10
    },
    message_avatar: {
        width: 50,
        height: 50,
        objectFit: "cover",
        borderRadius: 25
    },
    messages_author: {
        color: "white",
        fontSize: 25,
    },
    message_text_container: {
        flex: 1,
        flexShrink: 1,
    },
    messages_content: {
        color: "white",
        flexShrink: 1,
    },
});

export default styles;