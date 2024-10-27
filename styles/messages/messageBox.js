import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    message_bar_container: {
        paddingLeft: 10,
        paddingRight: 10,
        display: "flex",
        gap: 10,
        flexDirection: "row",
        paddingTop: 5
    },
    message_box: {
        flex: 1,
        height: 50,
        backgroundColor: "#353535",
        padding: 15,
        color: "white",
        borderRadius: 25
    },
    send_button: {
        width: 50,
        height: 50
    },
});

export default styles;