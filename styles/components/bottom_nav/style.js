import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: "#19120E",
        display: "flex",
        justifyContent: "space-evenly",
        flexDirection: "row",
        paddingTop: 15,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: "#452E20"
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 100,
        backgroundColor: "white",
        borderWidth: 3,
        borderColor: "white"
    }
})

export default styles;