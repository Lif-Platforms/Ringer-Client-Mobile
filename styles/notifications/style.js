import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        display: "flex",
        justifyContent: "space-between",
        height: "100%"
    },
    header_text: {
        color: "white",
        margin: 20,
        fontSize: 45,
        fontWeight: "bold"
    },
    requests_viewer: {
        flex: 1,
        padding: 20
    },
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
    info_text: {
        color: "white",
        textAlign: "center"
    },
    notifications_loader: {
        color: "white",
        marginTop: "auto",
        marginBottom: "auto"
    }
})

export default styles;