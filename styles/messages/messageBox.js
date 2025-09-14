import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    message_bar_container: {
        paddingLeft: 10,
        paddingRight: 10,
        display: "flex",
        gap: 10,
        flexDirection: "row",
        paddingTop: 5,
        position: 'relative'
    },
    message_box: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        height: 50,
        backgroundColor: "#1C1C1C",
        borderColor: "#353535",
        borderWidth: 1,
        padding: 5,
        borderRadius: 25
    },
    send_button: {
        width: 40,
        height: 40,
    },
    message_input: {
        flex: 1,
        color: "white",
        paddingLeft: 15,
        paddingRight: 10,
        textAlignVertical: 'center',
    },
    controls: {
        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        gap: 7,
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