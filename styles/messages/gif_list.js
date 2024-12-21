import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    loading_text: {
        color: "white",
        textAlign: "center"
    },
    gif: {
        width: 120,
        height: 120,
        borderRadius: 10
    },
    gif_list: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        flexGrow: 1,
        gap: 10,
        paddingBottom: 55
    },
    gif_scroll: {
        padding: 10,
        margin: "auto",
    },
    selected_gif: {
        borderColor: "#ff9500",
        borderWidth: 5
    }
});

export default styles;