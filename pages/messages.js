import { View, Text, Image, StatusBar, Dimensions, TextInput, KeyboardAvoidingView, ScrollView } from "react-native";
import styles from "../styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import getEnvVars from "../variables";
import SlidingUpPanel from 'rn-sliding-up-panel';
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import { eventEmitter } from "../scripts/emitter";

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

export function MessagesPage({ route, navigation }) {
    const { username, conversation_id } = route.params;
    const [userPronouns, setUserPronouns] = useState("Loading...");
    const [userBio, setUserBio] = useState("Loading...");
    const [messages, setMessages] = useState("loading");
    const scrollViewRef = useRef();
    const { sendMessage } = useWebSocket();
    const [messageValue, setMessageValue] = useState("");
    const messagebox_ref = useRef();
    const [isSending, setIsSending] = useState(false);

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

    function handle_navigation_back() {
        navigation.goBack();
    }

    useEffect(() => {
        async function fetch_pronouns() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_pronouns/${username}`);
    
            if (response.ok) {
                const pronouns = (await response.text()).slice(1, -1);
                setUserPronouns(pronouns);
            } else {
                console.error("Pronouns Request Failed! Status code: " + response.status)
                setUserPronouns("Error Fetching Pronouns");
            }
        }
        fetch_pronouns();
    }, []);

    useEffect(() => {
        async function fetch_bio() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_bio/${username}`);
    
            if (response.ok) {
                const bio = (await response.text()).slice(1, -1);
                setUserBio(bio);
            } else {
                console.error("Bio Request Failed! Status code: " + response.status)
                setUserBio("Error Fetching Bio");
            }
        }
        fetch_bio();
    }, []);

    useEffect(() => {
        async function get_friends() {
            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Fetch friends from server
            const response = await fetch(`${getEnvVars.ringer_url}/load_messages/${conversation_id}`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            });

            if (response.ok) {
                setMessages(await response.json());
            } else {
                setMessages("Messages_Error");
            }
        }
        get_friends();
    }, []);

    function handle_message_send() {
        setIsSending(true);
        sendMessage(messageValue, conversation_id);

        // Clear message box
        messagebox_ref.current.clear();
    }

    // Add event listener for message updates
    useEffect(() => {
        const handle_message_update = (event) => {
          // Check if the update was for this conversation
          if (event.id === conversation_id) {
            // Use functional state update to ensure the latest state is used
            setMessages((prevMessages) => [...prevMessages, event.message]);
          }
        };
    
        // Add the event listener
        eventEmitter.on('Message_Update', handle_message_update);
    
        // Cleanup function to remove the event listener
        return () => {
          eventEmitter.off('Message_Update', handle_message_update);
        };
    }, []);

    // Add event listener for message send event
    useEffect(() => {
        const handle_message_sent = () => {
            setIsSending(false);
        }

        eventEmitter.on("Message_Sent", handle_message_sent);

        return () => {
            eventEmitter.off("Message_Sent", handle_message_sent);
        }
    })

    return (
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.header_left_container}>
                    <TouchableOpacity onPress={handle_navigation_back}>
                        <Image style={styles.back_button} source={require("../assets/messages/back_icon.png")} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }}
                        style={styles.header_avatar}
                    />
                    <Text style={styles.conversation_user}>{username}</Text>
                </View>
                <TouchableOpacity style={styles.more_icon_container} onPress={() => this._panel.show({toValue: Dimensions.get('window').height / 2})}>
                    <Image style={styles.more_icon} source={require("../assets/messages/more_icon.png")} />
                </TouchableOpacity>
            </View>
            <ScrollView 
                contentContainerStyle={styles.messages_viewer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}
            >
                {Array.isArray(messages) ? (
                    messages.map((message, index) => (
                        <View key={index} style={styles.message}>
                            <Image
                                source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${message.Author}.png` }}
                                style={styles.message_avatar}
                            />
                            <View style={styles.message_text_container}>
                                <Text style={styles.messages_author}>{message.Author}</Text>
                                <Text style={styles.messages_content} selectable={true}>{message.Message}</Text>
                            </View>
                        </View>
                    ))
                ) : messages === "loading" ? (
                    <Text style={styles.message_loading}>Loading...</Text>
                ) : (
                    <Text>Error Loading messages</Text>
                )}
            </ScrollView>
            <KeyboardAvoidingView 
                behavior="padding" 
                style={styles.message_bar_container}
                keyboardVerticalOffset={65}
            >
                <TextInput 
                    style={styles.message_box} 
                    ref={messagebox_ref}
                    placeholder={`Message ${username}`} 
                    placeholderTextColor="#767676"
                    onFocus={() => setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100)}
                    onChangeText={text => setMessageValue(text)}
                    editable={!isSending}
                />
                <TouchableOpacity onPress={handle_message_send} disabled={isSending}>
                    <Image style={styles.send_button} source={require("../assets/messages/send_button.png")} />
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <SlidingUpPanel 
                ref={c => this._panel = c} 
                snappingPoints={[Dimensions.get('window').height / 2]}
            >
                <View style={styles.more_panel}>
                    <Image style={styles.more_panel_banner} source={{uri: `${getEnvVars.auth_url}/profile/get_banner/${username}.png?timestamp=${new Date().getTime()}`}} />
                    <Image style={styles.more_panel_avatar} source={{uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png?timestamp=${new Date().getTime()}`}} />
                    <Text style={styles.more_panel_username}>{username}</Text>
                    <View style={styles.more_panel_info}>
                        <Text style={styles.more_panel_section_title}>Pronouns</Text>
                        <Text style={styles.more_panel_section}>{userPronouns}</Text>
                        <Text style={styles.more_panel_section_title}>Bio</Text>
                        <Text style={styles.more_panel_section}>{userBio}</Text>
                    </View>  
                </View>
            </SlidingUpPanel>
        </View>
    )
}