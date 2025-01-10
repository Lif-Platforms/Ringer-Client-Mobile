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
        fontSize: 30,
    },
    requests_viewer: {
        flex: 1,
        padding: 10
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