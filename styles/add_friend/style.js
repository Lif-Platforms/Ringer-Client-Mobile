import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        gap: 40,
        marginTop: 20
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
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        flexShrink: 1
    },
    screen: {
        padding: 20,
        flexShrink: 1,
        display: "flex",
        flexDirection: "column",
        gap: 20,
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
    preview_avatar: {
        width: 25,
        height: 25,
        borderRadius: 100,
        backgroundColor: "gray"
    },
    preview_header: {
        display: "flex",
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
    },
    preview_username: {
        color: "white",
        fontSize: 25,
        fontWeight: "bold",
    },
    preview_title: {
        color: "#a9a9a9",
        fontSize: 15,
    },
    preview_message_input: {
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "#353535",
        borderRadius: 8,
        padding: 10,
        color: "white",
        fontSize: 16,
        minHeight: 60,
        textAlignVertical: "top",
    },
    preview_buttons: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-end",
    },
    preview_button_cancel: {
        backgroundColor: "#1C1C1C",
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#353535",
    },
    preview_button_text_cancel: {
        color: "white",
        fontSize: 16,
    },
    preview_button_send: {
        backgroundColor: "orange",
        padding: 10,
        borderRadius: 5,
    },
    preview_button_text_send: {
        fontSize: 16,
    }
});

export default styles;