import { StyleSheet } from 'react-native';

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

export default styles;