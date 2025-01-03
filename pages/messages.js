import { ActivityIndicator, Keyboard, View, Text, Image, StatusBar, Dimensions, ScrollView, Alert, Platform } from "react-native";
import styles from "../styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import getEnvVars from "../variables";
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import { eventEmitter } from "../scripts/emitter";
import MessageBox from "../components/messages page/message_box";
import GIFModal from '../components/messages page/gif_modal';
import Message from "../components/messages page/message";

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
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [loadMoreMessages, setLoadMoreMessages] = useState(false);
    const currentScrollPosition = useRef(0);
    const currentScrollHight = useRef(0);
    const previousScrollHight = useRef(0);
    const [showGIFModal, setShowGIFModal] = useState(false);

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
        let header_color;

        // Change header color if GIF modal is open
        if (showGIFModal) {
            header_color = '#0e0a07';   
        } else {
            header_color = '#19120E';
        }

        navigation.setOptions({
            headerTitle: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: header_color,
                height: 55,
                shadowColor: 'transparent'
            }
        });    
    }, [navigation, showGIFModal]);

    function handle_navigation_back() {
        navigation.goBack();
    }

    useEffect(() => {
        async function load_messages() {
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
                const data = await response.json();

                if (data.length >= 20) {
                    setLoadMoreMessages(true);
                }
                setMessages(data);

                // Scroll to end of conversation
                // Set timeout to ensure messages load before scrolling
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: false });
                    }
                }, 1);  
            } else {
                setMessages("Messages_Error");
            }
        }
        load_messages();
    }, []);

    // Add event listener for message updates
    useEffect(() => {
        const handle_message_update = async (event) => {
          // Check if the update was for this conversation
          if (event.id === conversation_id) {
            // Use functional state update to ensure the latest state is used
            setMessages((prevMessages) => [...prevMessages, event.message]);

            // Scroll to end of conversation
            // Set timeout to ensure messages load before scrolling
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
            }, 1);  
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

    async function handle_scroll(event) {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        currentScrollPosition.current = scrollPosition;
        
        if (scrollPosition <= 0  && !isLoadingMoreMessages && messages.length >= 20 && loadMoreMessages) {
            setIsLoadingMoreMessages(true);

            // Fetch auth credentials
            const credentials = await get_auth_credentials();

            // Fetch messages from server
            fetch(`${getEnvVars.ringer_url}/load_messages/${conversation_id}?offset=${messages.length}`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something Went Wrong");
                }
            })
            .then((data) => {
                // Set loading state to false
                setIsLoadingMoreMessages(false);

                // Add messages to list
                const messages_ = [...data, ...messages];
                setMessages(messages_);

                // Check if there are more messages to load
                if (data.length < 20) {
                    setLoadMoreMessages(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setIsLoadingMoreMessages(false);
            })
        }
    }

    function handle_content_size_change(width, height) {
        // If conversation is loading more messages then don't scroll
        if (!isLoadingMoreMessages) {
            // Save previous scroll height
            previousScrollHight.current = currentScrollHight.current;

            // Save current scroll height
            currentScrollHight.current = height;

            // Scroll to end of conversation
            // Set timeout to ensure messages load before scrolling
            setTimeout(() => {
                if (scrollViewRef.current) {
                    // Calculate scroll position
                    const new_scroll_position = currentScrollHight.current - previousScrollHight.current + currentScrollPosition.current - 50; // Subtract 50 to move it up a bit so the user can see the new messages

                    scrollViewRef.current.scrollTo({ x: 0, y: new_scroll_position, animated: false });
                }
            }, 1); 
        }
    }

    // Handle dismissing the GIF modal
    function onDismiss() {
        setShowGIFModal(false);
    }

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
                onScroll={handle_scroll}
                onContentSizeChange={handle_content_size_change}
            >
                {isLoadingMoreMessages ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ): null}
                {Array.isArray(messages) ? (
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            message={message}
                            index={index}
                        />
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
                setShowGIFModal={setShowGIFModal}
            />
            <GIFModal
                showGIFModal={showGIFModal}
                onDismiss={onDismiss}
                conversation_id={conversation_id}
            />
        </View>
    )
}