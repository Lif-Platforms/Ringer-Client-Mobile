import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    modal: {
      backgroundColor: "#1C1C1C",
      width: "100%",
      position: "absolute",
      zIndex: 999,
      bottom: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    modal_container: {
        backgroundColor: "#00000078",
        height: "100%",
        width: "100%",
        zIndex: 998,
        position: "absolute",
        bottom: 0
    },
    bar: {
        marginLeft: "auto",
        marginRight: "auto",
        width: 50,
        height: 5,
        borderRadius: 100,
        backgroundColor: "#4f4f4f",
        marginTop: 10
    },
    search_bar_container: {
        padding: 10
    },
    search_bar: {
        width: "100%",
        height: 40,
        backgroundColor: "#2a2a2a",
        borderColor: "#3b3b3b",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        color: "white"
    }
});

export default styles;