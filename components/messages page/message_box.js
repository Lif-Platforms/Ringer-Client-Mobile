import { View, TextInput, TouchableOpacity, Image, Animated, Keyboard, Text } from "react-native";
import { useRef, useState, useEffect } from "react";
import styles from "../../styles/messages/messageBox";
import { eventEmitter } from "../../scripts/emitter";
import * as SecureStore from 'expo-secure-store';

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

export default function MessageBox({
    isSending,
    username,
    setMessageValue,
    setIsSending,
    conversation_id,
    sendMessage,
    messageValue,
    scrollViewRef,
    updateTypingStatus,
}) {
    const messageBoxRef = useRef();
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [bottomPadding, setBottomPadding] = useState(40);
    const [isTyping, setIsTyping] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const typingTimeout = useRef(null);
    const isUserTyping = useRef(false);

    function handle_message_send() {
        // Refocus the message box
        messageBoxRef.current.focus();

        // Check to ensure message is not blank
        if (messageValue.trim() !== "") {
            setIsSending(true);
            sendMessage(messageValue, conversation_id);

            // Clear message box and message value
            messageBoxRef.current.clear();
            setMessageValue("");

            // Update typing status after message is sent and clear typing timeout
            clearTimeout(typingTimeout.current);
            updateTypingStatus(false, conversation_id);
        }
    }

    // Listen for typing updates
    useEffect(() => {
        const handle_user_typing = async (data) => {
            const current_user = await getValueFor('username');

            if (data.user !== current_user && data.conversation_id === conversation_id) {
                setIsTyping(data.typing);
            }
        }

        eventEmitter.on('User_Typing', handle_user_typing);

        return () => {
            eventEmitter.off('User_Typing', handle_user_typing);
        }
    }, []);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardWillShow', (event) => {
            Animated.spring(keyboardHeight, {
            toValue: event.endCoordinates.height,
            tension: 60,
            friction: 10,
            useNativeDriver: false,
            }).start();

            // Adjust padding based on keyboard state
            setBottomPadding(10);
        });

        const hideSubscription = Keyboard.addListener('keyboardWillHide', (event) => {
            Animated.spring(keyboardHeight, {
            toValue: 0,
            tension: 30, 
            friction: 8,
            useNativeDriver: false,
            }).start();

            // Adjust padding based on keyboard state
            setBottomPadding(40);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => { 
        if (isTyping) { 
            Animated.parallel([ 
                Animated.timing(fadeAnim, { 
                    toValue: 1, // Fully visible 
                    duration: 100, // Animation duration 
                    useNativeDriver: true, 
                }), 
                Animated.timing(scaleAnim, { 
                    toValue: 1, // Fully scaled 
                    duration: 100, // Animation duration 
                    useNativeDriver: true, 
                }), 
            ]).start();
        } else { 
            Animated.parallel([
                Animated.timing(fadeAnim, { 
                    toValue: 0, // Fully hidden 
                    duration: 100, // Animation duration 
                    useNativeDriver: true, 
                }), 
                Animated.timing(scaleAnim, { 
                    toValue: 0.9, // Fully scaled down 
                    duration: 100, // Animation duration 
                    useNativeDriver: true, 
                }), 
            ]).start();
        } 
    }, [isTyping, fadeAnim]);

    function handle_user_typing(text) {
        // Update message value with new text
        setMessageValue(text);

        // Check if timeout exists
        // If so, clear it
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        // Set typing timeout so the server will be notified when the user stops typing
        typingTimeout.current = setTimeout(() => {
            updateTypingStatus(false, conversation_id);
            isUserTyping.current = false;
        }, 3000);

        // Set current typing status to true but only if it is currently false
        if (!isUserTyping.current && text) {
            updateTypingStatus(true, conversation_id);
            isUserTyping.current = true;
        }
    }

    // Handle component unmount
    useEffect(() => {
        // Set typing status to false and remove timeout
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
            if (isUserTyping.current) {
                isUserTyping.current = false;
                updateTypingStatus(false, conversation_id);
            }
        }
    }, []);

    return (
        <Animated.View 
            style={[
                styles.message_bar_container, 
                {
                    marginBottom: keyboardHeight,
                    paddingBottom: bottomPadding,
                }
            ]}
        >
            <Animated.View style={[styles.typing_indicator_container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.typing_indicator}>{username} is typing...</Text>
            </Animated.View>
            <TextInput
                style={styles.message_box}
                ref={messageBoxRef}
                placeholder={`Message ${username}`}
                placeholderTextColor="#767676"
                onFocus={() => setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 300)}
                onChangeText={text => handle_user_typing(text)}
            />
            <TouchableOpacity onPress={handle_message_send} disabled={isSending}>
                <Image style={styles.send_button} source={require("../../assets/messages/send_button.png")} />
            </TouchableOpacity>
        </Animated.View>
    );
}