import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    request: {
        backgroundColor: "#ffffff1c",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    request_controls: {
        display: "flex",
        flexDirection: "row",
        gap: 15
    },
    request_controls_image: {
        width: 25,
        height: 25,
        objectFit: "contain",
        margin: "auto",
    },
    request_controls_button: {
        padding: 5,
        backgroundColor: "#ffffff42",
        borderRadius: 5
    },
    request_text: {
        color: "white",
        fontSize: 20,
        marginTop: "auto",
        marginBottom: "auto"
    },
    notifications_loader: {
        color: "white",
        marginTop: "auto",
        marginBottom: "auto"
    }
});

export default styles;