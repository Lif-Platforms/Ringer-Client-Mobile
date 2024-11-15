import { Keyboard, View, Text, Image, StatusBar, Dimensions, ScrollView, Alert, Platform } from "react-native";
import styles from "../styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import { eventEmitter } from "../scripts/emitter";
import MessageBox from "../components/messages page/message_box";
import NotificationBadge from "../components/global/notification";

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
    const { username, conversation_id, online } = route.params;
    const [messages, setMessages] = useState("loading");
    const scrollViewRef = useRef();
    const { sendMessage, updateTypingStatus } = useWebSocket();
    const [messageValue, setMessageValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    // Set online status when page loads
    useEffect(() => {
        setIsOnline(online);
    }, []);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    // Listen for keyboard events
    useEffect(() => {
        const keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        }
    }, []);

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

    // Add event listener for message updates
    useEffect(() => {
        const handle_message_update = async (event) => {
          // Check if the update was for this conversation
          if (event.id === conversation_id) {
            // Use functional state update to ensure the latest state is used
            setMessages((prevMessages) => [...prevMessages, event.message]);

          } else {
            const credentials = await get_auth_credentials();

            if (event.message.Author !== credentials.username) {
                // Show notification of incoming message
                eventEmitter.emit('Show_Notification', {
                    title: event.message.Author,
                    content: event.message.Message,
                    conversation_id: event.id
                });
            }
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
    });

    function handle_profile_navigation() {
        // Navigate to user profile page
        navigation.push("User Profile", {
            username: username,
            loaded_messages: messages,
            conversation_id: conversation_id
        });
    }

    // Listen for online status update
    useEffect(() => {
        const handle_status_change = (data) => {
            if (data.user === username) {
                setIsOnline(data.online);
            }
        }

        eventEmitter.on('User_Status_Update', handle_status_change);

        return () => {
            eventEmitter.off('User_Status_Update', handle_status_change);
        }
    }, []);

    return (
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.header_left_container}>
                    <TouchableOpacity onPress={handle_navigation_back}>
                        <Image style={styles.back_button} source={require("../assets/messages/back_icon.png")} />
                    </TouchableOpacity>
                    <View>
                        <Image
                            source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }}
                            style={styles.header_avatar}
                        />
                        <View style={[styles.status_indicator, {backgroundColor: isOnline ? 'lightgreen' : 'gray'}]} />
                    </View>
                    <TouchableOpacity disabled={messages === "loading" ? true : false} style={styles.header_user_container} onPress={handle_profile_navigation}>
                        <Text style={styles.conversation_user}>{username}</Text>
                        <Image style={styles.more_arrow} source={require("../assets/messages/more_arrow.png")} />
                    </TouchableOpacity>
                </View>
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
            <MessageBox
                isSending={isSending}
                username={username}
                setMessageValue={setMessageValue}
                sendMessage={sendMessage}
                conversation_id={conversation_id}
                messageValue={messageValue}
                setIsSending={setIsSending}
                scrollViewRef={scrollViewRef}
                updateTypingStatus={updateTypingStatus}
            />
        </View>
    )
}