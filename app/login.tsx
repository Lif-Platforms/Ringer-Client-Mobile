import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Image,
    Dimensions,
    StyleSheet,
    Animated,
    Easing
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@providers/auth";

// Get dimensions of screen
const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loginStatus, setLoginStatus] = useState<string>('');
    const [headerImageDimensions, setHeaderImageDimensions] = useState<{ width: number; height: number }>({ width: 386, height: 286 });
    const [twoFACode, setTwoFACode] = useState<string>("");
    const formContainerTranslateX = useRef(new Animated.Value(0)).current;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { login, prompt2FACode } = useAuth();

    const router = useRouter();

    async function handle_login() {
        setIsLoading(true);

        // Attempt to login
        try {
            setLoginStatus("");
            const supplyTwoFACode = prompt2FACode ? twoFACode : null;
            await login(username, password, supplyTwoFACode);
            setIsLoading(false);
        } catch (error) {
            if (error instanceof Error) {
                setLoginStatus(error.message);
            } else {
                setLoginStatus('An unknown error occurred.');
            }
            setIsLoading(false);
        }
    }

    // Adjust header dimensions based on screen size
    useEffect(() => {
        if (width === 375 && height === 667) {
            setHeaderImageDimensions({width: 250, height: 200});
        }
    }, []);

    const formContainerWidth = Dimensions.get("screen").width * 2;
    const formScreenWidth = formContainerWidth / 2;

    useEffect(() => {
        if (prompt2FACode) {
            Animated.timing(formContainerTranslateX, {
                toValue: -formScreenWidth,
                duration: 250,
                easing: Easing.back(2),
                useNativeDriver: true
            }).start();
        }
    }, [prompt2FACode]);

    return(
        <View style={styles.page}>
            <StatusBar barStyle="light-content" />
            <Image
                resizeMode="contain"
                source={require('../assets/login/header_image.png')}
                onError={(error) => console.log('Error loading image:', error)}
                style={{width: headerImageDimensions.width, height: headerImageDimensions.height}}
            />
            <Animated.View
                style={[styles.formContainer, { 
                    width: formContainerWidth,
                    transform: [
                        { translateX: formContainerTranslateX }
                    ]
                }]}
            >
                <View style={{ width: formScreenWidth}}>
                    <Text style={styles.header}>Login With Lif</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Username" 
                        placeholderTextColor="#A9A9A9"
                        onChangeText={text => setUsername(text)}
                        editable={!isLoading}
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Password" 
                        placeholderTextColor="#A9A9A9" 
                        secureTextEntry={true} 
                        onChangeText={text => setPassword(text)}
                        editable={!isLoading}
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
                <View style={{ width: formScreenWidth}}>
                    <Text style={styles.header}>2FA Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Code"
                        placeholderTextColor="#A9A9A9"
                        onChangeText={text => setTwoFACode(text)}
                        editable={!isLoading}
                    />
                    <TouchableOpacity style={styles.button} onPress={handle_login}>
                        <Text style={styles.button_text}>Login</Text>
                    </TouchableOpacity>
                    <Text style={styles.login_status}>{loginStatus}</Text>
                </View>
            </Animated.View>
        </View>
    )
}

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
    },
    formContainer: {
        display: "flex",
        flexDirection: "row"
    }
});