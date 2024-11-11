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
    typing_indicator: {
        color: 'white',
        width: '100%',
    },
    typing_indicator_container: {
        position: 'absolute',
        top: -40,
        backgroundColor: '#363636',
        padding: 10,
        borderRadius: 10,
        width: '100%',
        marginLeft: 10,
    }
});

export default styles;