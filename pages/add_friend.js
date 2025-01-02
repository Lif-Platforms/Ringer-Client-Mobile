import { Text, Image, View, TouchableOpacity, TextInput, Keyboard } from "react-native";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/add_friend/style";
import * as SecureStore from 'expo-secure-store';
import getEnvVars from "../variables";
import { ScrollView } from "react-native-gesture-handler";
import SearchResult from "../components/add friend/search_result";

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
    const [searchResults, setSearchResults] = useState(null);
    const [addUser, setAddUser] = useState();
    const websocketConn = useRef();
    const [isConnected, setIsConnected] = useState(false);
    const searchBoxRef = useRef();

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
                backgroundColor: '#160900',
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
                alert("User Added!", "You send a friend request to this user.");
                navigation.goBack();
            } else {
                throw new Error("Request failed! Status code: " + response.status);
            }
        })
        .catch((error) => {
            console.error(error);
            setAddButtonText("Add")
            alert("Error", "Something Went Wrong!")
        })
    }

    // Connect to websocket
    useEffect(() => {
        websocketConn.current = new WebSocket(`${getEnvVars.ringer_url_ws}/user_search`);

        websocketConn.current.onopen = () => {
            console.log("Websocket connected");
            setIsConnected(true);
        }

        websocketConn.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);

            setSearchResults(data);
        }

        websocketConn.current.onclose = () => {
            console.log("Websocket closed");
        }

        return () => {
            websocketConn.current.close();
        }
    }, []);
    
    // Send search query to server
    useEffect(() => {
        if (addUser) {
            websocketConn.current.send(JSON.stringify({user: addUser}));
        }
    }, [addUser]);

    // Focus the search bar when websocket connects
    useEffect(() => {
        if (isConnected) {
            searchBoxRef.current.focus();
        }
    }, [isConnected]);

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.back_button} onPress={() => navigation.goBack()}>
                    <Image style={styles.back_button_icon} source={require("../assets/add_friend/back_icon.png")} />
                </TouchableOpacity>
                <Text style={styles.header_text}>Add Friends</Text>
            </View>
            <View style={styles.container}>
                <TextInput
                    onChangeText={(text) => setAddUser(text)}
                    style={[styles.user_entry, {opacity: isConnected ? 1 : 0.5}]}
                    placeholder="Search..."
                    placeholderTextColor="#494949"
                    keyboardAppearance="dark"
                    editable={isConnected}
                    ref={searchBoxRef}
                />
                <ScrollView 
                    style={styles.search_results}
                    onScrollBeginDrag={() => Keyboard.dismiss()} // Dismiss keyboard when scrolling
                >
                    {searchResults ? (
                        searchResults.length === 0 ? (
                            <Text style={styles.start_search_text}>No Results Found</Text>
                        ) : (
                            searchResults.map((result, index) => (
                                <SearchResult key={index} username={result} />
                            ))
                        )
                    ) : (
                        <Text style={styles.start_search_text}>Start By Typing</Text>
                    )}
                </ScrollView>
            </View>
        </View>
    )
}