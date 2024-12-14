import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%"
    },
    user_banner: {
        height: 300
    },
    banner_gradient: {
        position: "absolute",
        top: 0,
        height: 300,
        width: "100%"
    },
    avatar_container: {
        width: "100%",
        position: "absolute",
        top: 200,
        flex: 1,
        alignItems: "center"
    },
    user_avatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    user_info: {
        marginTop: 180,
        padding: 15
    },
    title: {
        color: "white",
        fontSize: 30
    },
    info: {
        color: "white",
        backgroundColor: "#181818",
        padding: 10,
        fontSize: 20,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 15
    },
    username: {
        color: "white",
        position: "absolute",
        top: 410,
        textAlign: "center",
        width: "100%",
        fontSize: 30,
        fontWeight: "bold"
    },
    back_button: {
        position: "absolute",
        top: 20,
        left: 10,
        zIndex: 999
    },
    buttons: {
        padding: 15,
        marginBottom: 35
    },
    button: {
        backgroundColor: "#FF9900",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15
    },
    button_text: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    }
});

export default styles;