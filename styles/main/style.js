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
    add_button: {
        position: "absolute",
        bottom: 25,
        right: 25,
        height: 50,
        width: 50,
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "#353535",
        borderRadius: 100
    },
    add_button_icon: {
        margin: "auto",
        width: 25,
        height: 25,
    },
})

export default styles;