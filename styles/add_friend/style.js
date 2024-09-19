import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%"
    },
    header: {
        backgroundColor: "#19120E",
        display: "flex",
        flexDirection: "row",
        gap: 20
    },
    header_text: {
        color: "white",
        fontSize: 45,
        fontWeight: "bold",
        marginTop: "auto",
        marginBottom: "auto"
    },
    back_button: {
        marginLeft: 10
    },
    user_entry: {
        height: 50,
        backgroundColor: "#353535",
        padding: 15,
        color: "white",
        borderRadius: 5,
        marginTop: "10%"
    },
    container: {
        padding: 15
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
    }
});

export default styles;