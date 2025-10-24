import {
    Text,
    Image,
    View,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Dimensions,
    Animated,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import styles from "@styles/add_friend/style";
import { ScrollView } from "react-native-gesture-handler";
import SearchResult from "@components/add friend/search_result";
import { useRouter } from "expo-router";
import { useAuth } from "@providers/auth";

export default function AddFriendPage() {
    const [searchResults, setSearchResults] = useState<null | string[]>(null);
    const [addUser, setAddUser] = useState<string | null>(null);
    const websocketConn = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const searchBoxRef = useRef<TextInput | null>(null);
    const [page, setPage] = useState<"search" | "preview">("search");
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const translateX = useRef(new Animated.Value(0)).current;
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [requestMessage, setRequestMessage] = useState<string>("");
    const requestMessageInput = useRef<TextInput | null>(null);

    // Connect to websocket
    useEffect(() => {
        websocketConn.current = new WebSocket(`${process.env.EXPO_PUBLIC_RINGER_SERVER_WS}/user_search`);

        websocketConn.current.onopen = () => {
            setIsConnected(true);
        }

        websocketConn.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setSearchResults(data);
        }

        return () => {
            if (websocketConn.current) {
                websocketConn.current.close();
            }
        }
    }, []);
    
    // Send search query to server
    useEffect(() => {
        if (!addUser || !websocketConn.current) return;

        const ws = websocketConn.current;
        const isOpen = typeof WebSocket !== "undefined"
            ? ws.readyState === WebSocket.OPEN
            : ws.readyState === 1;

        if (isOpen) {
            ws.send(JSON.stringify({ user: addUser }));
        }
    }, [addUser, isConnected]);

    // Focus the search bar when websocket connects
    useEffect(() => {
        if (isConnected && searchBoxRef.current) {
            searchBoxRef.current.focus();
        }
    }, [isConnected]);

    
    const router = useRouter();
    
    function handleNext(user: string) {
        setSelectedUser(user);
        setPage("preview");
    }
    
    // Calculate the width of the container and each screen
    const containerWidth = Dimensions.get("screen").width * 2;
    const screenWidth = containerWidth / 2;
    
    // Handle animation between screens
    useEffect(() => {
        // Dismiss he keyboard to ensure the user wont be typing on another page
        Keyboard.dismiss();

        if (requestMessageInput.current) requestMessageInput.current.clear();

        const toValue = page === "preview" ? -screenWidth : 0;

        Animated.timing(translateX, {
            toValue: toValue,
            duration: 250,
            useNativeDriver: true
        }).start();
    }, [page]);

    const { username, token } = useAuth();

    async function handle_add_user() {
        // Update loading status
        setIsAdding(true);

        if (!username || !token || !selectedUser) {
            Alert.alert("Error", "Something went wrong!");
            setIsAdding(false);
            return;
        }

        fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/friend_requests/v1/add_friend`, {
            headers: {
                "Content-Type": "application/json",
                username: username,
                token: token
            },
            method: "POST",
            body: JSON.stringify({
                recipient: selectedUser,
                message: requestMessage.trim().length > 0 ? requestMessage : null
            })
        })
        .then((response) => {
            if (response.ok) {
                setIsAdding(false);
                Alert.alert("Request Sent!", `You send a friend request to ${selectedUser}.`);
                setPage("search");
            } else if (response.status === 409) {
                setIsAdding(false);
                Alert.alert("Already Outgoing Request", "You already have an outgoing friend request to this user.");
            } else if (response.status === 404) {
                setIsAdding(false);
                Alert.alert("User Not Found", "The user you are trying to add does not exist.");
            } else {
                throw new Error("Request failed! Status code: " + response.status);
            }
        })
        .catch((error) => {
            console.error(error);
            setIsAdding(false);
            Alert.alert("Error", "Something Went Wrong!");
        })
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.back_button} onPress={() => router.back()}>
                    <Image style={styles.back_button_icon} source={require("@assets/add_friend/back_icon.png")} />
                </TouchableOpacity>
                <Text style={styles.header_text}>Add Friends</Text>
            </View>
            <Animated.View 
                style={[styles.container, { 
                    width: containerWidth,
                    transform: [{ translateX: translateX }]
                }]}
            >
                <View style={[styles.screen, { width: screenWidth }]}>
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
                                        <SearchResult key={index} username={result} handleNext={handleNext} />
                                    ))
                                )
                            ) : (
                                <Text style={styles.start_search_text}>Start By Typing</Text>
                            )}
                        </ScrollView>
                    </View>
                    <View style={[styles.screen, { width: screenWidth }]}>
                        <Text style={styles.preview_title}>You are about to send a friend request to:</Text>
                        <View style={styles.preview_header}>
                            <Image
                                style={styles.preview_avatar}
                                source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/v1/get_avatar/${selectedUser}.png`}}
                            />
                            <Text style={styles.preview_username}>{selectedUser}</Text>
                        </View>
                        <TextInput
                            style={styles.preview_message_input}
                            placeholder="Add a message (optional)"
                            placeholderTextColor="#494949"
                            keyboardAppearance="dark"
                            onChangeText={(text) => setRequestMessage(text)}
                            editable={!isAdding}
                            ref={requestMessageInput}
                            multiline
                        />
                        <View style={styles.preview_buttons}>
                            <TouchableOpacity
                                style={styles.preview_button_cancel}
                                onPress={() => setPage("search")}
                                disabled={isAdding}
                            >
                                <Text style={styles.preview_button_text_cancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.preview_button_send}
                                onPress={handle_add_user}
                                disabled={isAdding}
                            >
                                {isAdding ? (
                                    <ActivityIndicator size={"small"} color={"black"} />
                                ) : (
                                    <Text style={styles.preview_button_text_send}>Send</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
            </Animated.View>
        </View>
    )
}