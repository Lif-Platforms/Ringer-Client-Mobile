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
        fontSize: 20
    }
});

export default styles;