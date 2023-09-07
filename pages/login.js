import { View, Text, TouchableOpacity, StyleSheet, TextInput, Button, } from "react-native";

// Main stylesheet for login page
const main_styles = StyleSheet.create({
    page: {
        backgroundColor: 'black',
        height: '100%'
    },
    header: {
        color: 'orange',
        alignSelf: 'center',
        fontSize: 50,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 40
    },
    input: {
        alignSelf: "center",
        color: 'white',
        borderColor: '#A9A9A9',
        backgroundColor: "#2C2C2C",
        borderWidth: 3,
        width: 300,
        fontSize: 24,
        padding: 15,
        borderRadius: 16,
        marginTop: 20
    },
    button: {
        backgroundColor: 'orange',
        width: 150,
        alignSelf: 'center',
        padding: 15,
        borderRadius: 32,
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
    }
});

export function LoginScreen({ navigation }) {

    // Handle navigation to main page
    function handle_login() {
        navigation.reset({index: 0, routes: [{name: 'Main'}]});
    }

    return(
        <View style={main_styles.page}>
            <Text style={main_styles.header}>Login With Lif</Text>
            <TextInput style={main_styles.input} placeholder="Username" placeholderTextColor="#A9A9A9" />
            <TextInput style={main_styles.input} placeholder="Password" placeholderTextColor="#A9A9A9" secureTextEntry={true} />
            <TouchableOpacity style={main_styles.button} onPress={handle_login}>
                <Text style={main_styles.button_text}>Login</Text>
            </TouchableOpacity>
            <Text style={main_styles.bottom_text}>Don't have an account? <Text style={main_styles.create_account_text}>Create One!</Text></Text>
        </View>
    )
}