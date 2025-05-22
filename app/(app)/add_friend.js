import { Text, Image, View, TouchableOpacity, TextInput, Keyboard } from "react-native";
import { useEffect, useRef, useState } from "react";
import styles from "@styles/add_friend/style";
import { ScrollView } from "react-native-gesture-handler";
import SearchResult from "@components/add friend/search_result";
import { useRouter } from "expo-router";

export default function AddFriendPage() {
    const [searchResults, setSearchResults] = useState(null);
    const [addUser, setAddUser] = useState();
    const websocketConn = useRef();
    const [isConnected, setIsConnected] = useState(false);
    const searchBoxRef = useRef();

    // Connect to websocket
    useEffect(() => {
        websocketConn.current = new WebSocket(`${process.env.EXPO_PUBLIC_RINGER_SERVER_WS}/user_search`);

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

    const router = useRouter();

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.back_button} onPress={() => router.back()}>
                    <Image style={styles.back_button_icon} source={require("@assets/add_friend/back_icon.png")} />
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