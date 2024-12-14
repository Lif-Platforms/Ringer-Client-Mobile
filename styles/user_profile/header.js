import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: 120,
        zIndex: 999,
        paddingTop: 60,
        display: "flex",
        flexDirection: "row"
    },
    user_info: {
        marginTop: "auto",
        marginBottom: "auto",
        display: "flex",
        flexDirection: "row",
        gap: 15,
        marginLeft: 10
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 100,
    },
    username: {
        color: "white",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: 30
    },
    back_button: {
        marginTop: "auto",
        marginBottom: "auto"
    }
});

export default styles;