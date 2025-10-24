import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 100
    },
    user: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
    },
    username: {
        color: "white",
        fontSize: 25,
        marginVertical: "auto"
    },
    result: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#353535",
        paddingBottom: 10,
        alignItems: "center"
    },
    add_button: {
        backgroundColor: "#00430F",
        width: 30,
        height: 30,
        borderRadius: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    add_button_icon: {
        margin: "auto"
    }
});

export default styles;