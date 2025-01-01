import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        gap: 40
    },
    header_text: {
        color: "white",
        fontSize: 45,
        fontWeight: "bold",
        marginTop: "auto",
        marginBottom: "auto",
        flexGrow: 1
    },
    back_button: {
        marginLeft: 20,
    },
    back_button_icon: {
        margin: "auto"
    },
    user_entry: {
        height: 50,
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "#353535",
        padding: 15,
        color: "white",
        borderRadius: 8,
        marginTop: 10
    },
    container: {
        padding: 15,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        flexShrink: 1,
        paddingBottom: 40
    },
    add_button: {
        backgroundColor: "orange",
        width: 150,
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto"
    },
    add_button_text: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    },
    search_results: {
        height: "100%",
        backgroundColor: "#1C1C1C",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#353535",
        padding: 20
    },
    start_search_text: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
        marginTop: 20
    },
});

export default styles;