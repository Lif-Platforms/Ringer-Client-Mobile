import { Text, Image, View, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import styles from "../styles/add_friend/style";
import * as SecureStore from 'expo-secure-store';
import getEnvVars from "../variables";

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

export function AddFriendPage({ navigation }) {
    const [addButtonText, setAddButtonText] = useState("Add");
    const [addUser, setAddUser] = useState();

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    // Configure styles for header bar
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: '#19120E',
                height: 55,
                shadowColor: 'transparent'
            }
        });    
    }, [navigation]);

    async function handle_add_user() {
        setAddButtonText("Adding...");
        const credentials = await get_auth_credentials();

        const formData = new FormData();
        formData.append("user", addUser);

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
                alert("User Added!");
                navigation.goBack();
            } else {
                throw new Error("Request failed! Status code: " + response.status);
            }
        })
        .catch((error) => {
            console.error(error);
            setAddButtonText("Add")
            alert("Something Went Wrong!")
        })
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.back_button} onPress={() => navigation.goBack()}>
                    <Image source={require("../assets/add_friend/back_icon.png")} />
                </TouchableOpacity>
                <Text style={styles.header_text}>Add Friend</Text>
            </View>
            <View style={styles.container}>
                <TextInput onChangeText={(text) => setAddUser(text)} style={styles.user_entry} placeholder="Username" placeholderTextColor="#767676" />
                <TouchableOpacity onPress={handle_add_user} style={styles.add_button}>
                    <Text style={styles.add_button_text}>{addButtonText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}