import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - 40) / 2 - 10;

const styles = StyleSheet.create({
    page: {
        display: "flex",
        justifyContent: "space-between",
        height: "100%",
        backgroundColor: "#160900"
    },
    user_banner: {
        height: 150,
        width: "100%",
        objectFit: "cover",
    },
    user_avatar: {
        width: 150,
        height: 150,
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "100%",
        transform: [
            {translateY: -75}
        ]
    },
    header_text: {
        color: "white",
        fontSize: 35,
        transform: [
            {translateY: -50}
        ],
        textAlign: "center"
    },
    account_buttons: {
        flexDirection: 'row',
        justifyContent: "space-evenly",
        paddingLeft: 10,
        paddingRight: 10,
    },
    account_button: {
        backgroundColor: 'orange',
        padding: 10,
        borderRadius: 25,
        width: buttonWidth, // Set the calculated width
        marginHorizontal: 3, // Add margin to separate buttons
    },
    account_button_text: {
        textAlign: 'center',
        color: "white",
        fontWeight: "bold",
    },
    user_info_section: {
        padding: 20
    },
    user_info_header: {
        color: "white",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 10
    },
    user_info: {
        backgroundColor: "#151515",
        borderRadius: 10,
        overflow: "hidden",
        color: "white",
        padding: 10,
        marginBottom: 10
    }
})

export default styles;