import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import styles from "../../styles/add_friend/search_result";
import getEnvVars from "../../variables";
import * as SecureStore from 'expo-secure-store';
import { useState } from "react";

async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

export default function SearchResult({ username }) {
    const [isLoading, setIsLoading] = useState(false);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    async function handle_add_user() {
        // Update loading status
        setIsLoading(true);

        const credentials = await get_auth_credentials();

        const formData = new FormData();
        formData.append("user", username);

        fetch(`${getEnvVars.ringer_url}/add_friend`, {
            headers: {
                username: credentials.username,
                token: credentials.token
            },
            method: "POST",
            body: formData
        })
        .then((response) => {
            if (response.ok) {
                setIsLoading(false);
                Alert.alert("Request Sent!", `You send a friend request to ${username}.`);
            } else {
                throw new Error("Request failed! Status code: " + response.status);
            }
        })
        .catch((error) => {
            console.error(error);
            setIsLoading(false);
            Alert.alert("Error", "Something Went Wrong!");
        })
    }

    return (
        <View style={styles.result}>
            <View style={styles.user}>
                <Image source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }} style={styles.avatar} />
                <Text style={styles.username}>{username}</Text>
            </View>
            <TouchableOpacity 
                style={styles.add_button}
                onPress={handle_add_user}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator style={{margin: "auto"}} size="small" color="white" /> : <Image style={styles.add_button_icon} source={require("../../assets/add_friend/add_icon.png")} />}
            </TouchableOpacity>
        </View>
    )
}  