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
    info_text: {
        color: "white",
        textAlign: "center"
    }
})

export default styles;