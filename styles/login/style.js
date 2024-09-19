import { StyleSheet, Dimensions } from "react-native"

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#160900',
        height: '100%'
    },
    header: {
        color: 'orange',
        alignSelf: 'center',
        fontSize: 50,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 20
    },
    input: {
        alignSelf: "center",
        color: 'white',
        backgroundColor: "#1C1C1C",
        borderWidth: 0,
        width: 330,
        fontSize: 24,
        padding: 15,
        borderRadius: 16,
        marginTop: 20
    },
    button: {
        backgroundColor: 'orange',
        width: 170,
        alignSelf: 'center',
        padding: 15,
        borderRadius: 15,
        marginTop: 20
    },
    button_text: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25
    },
    bottom_text: {
        color: 'white',
        textAlign: "center",
        marginTop: 30
    },
    create_account_text: {
        color: 'orange'
    },
    login_status: {
        color: "red",
        textAlign: "center",
        fontSize: 20,
        marginTop: 20
    }
});

export default styles;