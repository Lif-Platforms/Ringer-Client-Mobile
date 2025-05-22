import { View, Text, TouchableOpacity, StatusBar, TextInput, Image, Dimensions } from "react-native";
import { useEffect, useState, useContext } from "react";
import styles from "@styles/login/style";
import { useRouter } from "expo-router";
import { AuthContext } from "@scripts/auth";

// Get dimensions of screen
const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('');
    const [editable, setEditable] = useState();
    const [headerImageDimensions, setHeaderImageDimensions] = useState({ width: 386, height: 286 });

    // Get navigation object
    const router = useRouter();

    // Get auth context
    const { login } = useContext(AuthContext);

    // Handle navigation to main page
    async function handle_login() {
        // Disable username and password entries
        setEditable(false);

        // Attempt to login
        try {
            await login(username, password);

            // Navigate to main page
            router.replace('/(tabs)');
        } catch (error) {
            setLoginStatus(error.message);
            setEditable(true);
        }
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
            <TouchableOpacity onPress={() => router.push('/create_account')}>
                <Text style={styles.bottom_text}>
                    Don't have an account? <Text style={styles.create_account_text}>Create One!</Text>
                </Text>
            </TouchableOpacity>  
        </View>
    )
}