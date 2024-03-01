import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, } from "react-native";

// Main stylesheet for login page
const main_styles = StyleSheet.create({
    page: {
        backgroundColor: '#160900',
        height: '100%'
    },
    header: {
        color: 'white',
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
    }
});

export function LoginScreen({ navigation }) {

    // Configure styles for header bar
    navigation.setOptions({
        headerTitle: '',
        headerStyle: {
            height: 0,
            backgroundColor: 'black',
        },
    });

    // Handle navigation to main page
    function handle_login() {
        navigation.reset({index: 0, routes: [{name: 'Main'}]});
    }

    return(
        <View style={main_styles.page}>
            <Image source={require('../assets/login/header-image.png')} />
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