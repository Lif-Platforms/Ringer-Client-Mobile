import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%",
        paddingTop: 60
    },
    icon: {
        marginHorizontal: "auto",
        marginVertical: 10
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: 40,
        textAlign: "center"
    },
    subtitle: {
        color: "white",
        textAlign: "center",
        marginVertical: 15,
        fontSize: 15,
        paddingHorizontal: 10
    },
    retry_button: {
        backgroundColor: "#ff9d00",
        padding: 10,
        borderRadius: 10,
        width: 150,
        marginVertical: 20,
        marginHorizontal: "auto"
    },
    retry_button_text: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20
    }
});

export default styles;