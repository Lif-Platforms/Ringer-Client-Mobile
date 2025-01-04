import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    reconnectBar: {
        position: "absolute",
        top: -50,
        width: "100%",
        paddingHorizontal: 10,
        alignItems: "center",
        zIndex: 999
    },
    reconnectText: {
        color: "#fff",
        backgroundColor: "#ff9d00",
        width: "100%",
        borderRadius: 5,
        textAlign: "center",
        padding: 10,
        fontWeight: "bold",
    },
});

export default styles;