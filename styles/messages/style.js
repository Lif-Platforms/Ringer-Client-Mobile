import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column"
    },
    header: {
        backgroundColor: "#19120E",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        paddingTop: 65,
    },
    header_loading_text: {
        color: "white",
        fontSize: 20,
        marginTop: "auto",
        marginBottom: "auto",
        marginLeft: 15,
    },
    back_button: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    header_left_container: {
        display: "flex",
        flexDirection: "row"
    },
    more_panel_banner: {
        width: "100%",
        height: 200,
        objectFit: "cover"
    },
    more_panel_avatar: {
        borderRadius: 100,
        width: 150,
        height: 150,
        marginLeft: "auto",
        marginRight: "auto",
        transform: [
            {translateY: -75}
        ]
    },
    messages_viewer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        padding: 16,
        width: "100%"
    },
    message_loading: {
        color: "white",
        textAlign: "center"
    },
})

export default styles;