import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    notification: {
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "#353535",
        padding: 5,
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    controls: {
        display: "flex",
        flexDirection: "row",
        gap: 10
    },
    controls_icon: {
        width: 25,
        height: 25,
        objectFit: "contain",
        margin: "auto",
    },
    controls_button: {
        padding: 5,
        borderRadius: 5
    },
    notification_text: {
        color: "white",
        fontSize: 15,
        marginTop: "auto",
        marginBottom: "auto",
        flexShrink: 1
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 100,
        marginTop: "auto",
        marginBottom: "auto",
        marginRight: 10
    },
    username: {
        color: "white",
        fontSize: 15,
        marginTop: "auto",
        marginBottom: "auto",
        fontWeight: "bold",
        marginRight: 5
    },
    text_container: {
        display: "flex",
        flexDirection: "row",
        flexShrink: 1
    },
    loader: {
        height: 30
    }
})

export default styles;