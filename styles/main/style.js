import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        height: "100%",
        backgroundColor: "#160900",
        display: "flex",
        justifyContent: "space-between"
    },
    title: {
        color: "white",
        fontSize: 30,
        marginLeft: 10,
        marginBottom: 10,
        marginTop: 10
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    friends_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#525252",
    },
    friendImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginRight: 10,
    },
    friendText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    noFriendsText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    status_indicator: {
        position: 'absolute',
        bottom: 0,
        right: 8,
        width: 15,
        height: 15,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#160900',
    },
    add_button: {
        marginRight: 20,
    },
    add_button_icon: {
        margin: "auto",
        width: 25,
        height: 25,
    },
    lastMessageText: {
        color: "#a0a0a0",
        fontSize: 20,
        overflow: 'hidden',
    },
    friendTextContainer: {
        flex: 1
    }
})

export default styles;