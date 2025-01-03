import { View, Text, TouchableOpacity, StatusBar, Linking, TextInput, Image, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import styles from "../styles/login/style";
import getEnvVars from "../variables";

// Get dimensions of screen
const { width, height } = Dimensions.get('window');

export function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('');
    const [editable, setEditable] = useState();
    const [headerImageDimensions, setHeaderImageDimensions] = useState({ width: 386, height: 286 });

    // Configure styles for header bar
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerShown: false,
            headerTintColor: 'white',
        });    
    }, [navigation]);

    async function secureSave(key, value) {
        await SecureStore.setItemAsync(key, value);
    }

    // Handle navigation to main page
    function handle_login() {
        // Get auth url
        const auth_url = getEnvVars.auth_url;

        // Disable username and password entries
        setEditable(false);

        // Create form data for request
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        // Make request to auth server
        fetch(`${auth_url}/auth/login`, {
            method: "POST",
            body: formData
        })
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else if (response.status === 401){
                throw new Error("Incorrect Username or Password");
            } else {
                throw new Error("Something Went Wrong!");
            }
        })
        .then((data) => {
            // Save username and token for later
            secureSave("username", username);
            secureSave("token", data.token);

            navigation.reset({index: 0, routes: [{name: 'Main'}]});
        })
        .catch((err) => {
            console.error(err);
            setLoginStatus(err.message);
            setEditable(true);
        })
    }

    // Adjust header dimensions based on screen size
    useEffect(() => {
        if (width === 375 && height === 667) {
            setHeaderImageDimensions({width: 250, height: 200});
        }
    }, []);

    return(
        <View style={styles.page}>
            <StatusBar style="light" />
            <Image
                resizeMode="contain"
                source={require('../assets/login/header_image.png')}
                onError={(error) => console.log('Error loading image:', error)}
                style={{width: headerImageDimensions.width, height: headerImageDimensions.height}}
            />
            <Text style={styles.header}>Login With Lif</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Username" 
                placeholderTextColor="#A9A9A9"
                onChangeText={text => setUsername(text)}
                editable={editable}
            />
            <TextInput 
                style={styles.input} 
                placeholder="Password" 
                placeholderTextColor="#A9A9A9" 
                secureTextEntry={true} 
                onChangeText={text => setPassword(text)}
                editable={editable}
            />
            <TouchableOpacity style={styles.button} onPress={handle_login}>
                <Text style={styles.button_text}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.login_status}>{loginStatus}</Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://my.lifplatforms.com/create_account")}>
                <Text style={styles.bottom_text}>
                    Don't have an account? <Text style={styles.create_account_text}>Create One!</Text>
                </Text>
            </TouchableOpacity>  
        </View>
    )
}