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
    header_avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        marginLeft: 15
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
    conversation_user: {
        color: "white",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: 25
    },
    more_arrow: {
        marginTop: "auto",
        marginBottom: "auto",
        width: 20,
        height: 20,
        objectFit: "contain",
        marginLeft: 10
    },
    header_user_container: {
        marginBottom: "auto",
        marginTop: "auto",
        display: "flex",
        flexDirection: "row"
    },
    more_panel: {
        backgroundColor: "#1b1b1b",
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
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
    more_panel_username: {
        color: "white",
        textAlign: "center",
        transform: [
            {translateY: -60}
        ],
        fontSize: 30
    },
    more_panel_section_title: {
        color: "white",
        fontSize: 20,
    },
    more_panel_info: {
        paddingLeft: 20,
        paddingRight: 20
    },
    more_panel_section: {
        backgroundColor: "#020202",
        width: "100%",
        color: "white",
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10
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
    more_panel_bottom_buttons: {
        display: "flex",
        justifyContent: "center",
        padding: 20
    },
    more_panel_bottom_button: {
        backgroundColor: "#FF8A00",
        padding: 10,
        borderRadius: 100,
        marginBottom: 15
    },
    more_panel_bottom_button_text: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 20
    },
    status_indicator: {
        position: 'absolute',
        bottom: 0,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#2E241D'
    },
})

export default styles;