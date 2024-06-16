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
        fontSize: 45,
        fontWeight: "bold",
        margin: 20
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    friends_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        padding: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#ffffff1c',
        borderRadius: 8,
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    friendText: {
        color: 'white',
        fontSize: 25,
    },
    noFriendsText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
})

export default styles;