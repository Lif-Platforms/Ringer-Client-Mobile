import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
    Keyboard,
    Text,
    Dimensions,
    FlatList,
    TouchableOpacityProps
} from "react-native";
import { useRef, useState, useEffect, SetStateAction, RefObject } from "react";
import styles from "../../styles/messages/messageBox";
import { eventEmitter } from "../../scripts/emitter";
import { AddMediaOptions } from "./add_media_options";
import { useConversationData } from "@scripts/conversation_data_provider";
import { useWebSocket } from "@providers/websocket_handler";
import { useAuth } from "@providers/auth";

type MessageBoxProps = {
    isSending: boolean;
    setIsSending: React.Dispatch<SetStateAction<boolean>>;
    setMessageValue: React.Dispatch<SetStateAction<string>>;
    scrollViewRef: RefObject<FlatList | null>;
    setShowGIFModal: React.Dispatch<SetStateAction<boolean>>;
    messageValue: string;
}

export default function MessageBox({
    isSending,
    setMessageValue,
    setIsSending,
    messageValue,
    scrollViewRef,
    setShowGIFModal
}: MessageBoxProps) {
    const messageBoxRef = useRef<TextInput>(null);
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [bottomPadding, setBottomPadding] = useState(40);
    const [isTyping, setIsTyping] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const typingTimeout = useRef<NodeJS.Timeout>(null);
    const isUserTyping = useRef(false);
    const [showMediaOptions, setShowMediaOptions] = useState(false);
    const addMediaButtonRef = useRef<View>(null);
    const [addMediaOptionsRightPosition, setAddMediaOptionsRightPosition] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);

    const {
        isLoading: isConversationLoading,
        conversation_id,
        conversationName: username
    } = useConversationData();
    const { updateTypingStatus, sendMessage } = useWebSocket();
    const { username: currentUser } = useAuth();

    // Enable/disable message box based on if sending or if loading
    useEffect(() => {
        if (isSending || isConversationLoading) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [isSending, isConversationLoading]);

    function handle_message_send() {
        if (!messageBoxRef.current) { return };

        // Refocus the message box
        messageBoxRef.current.focus();

        // Check to ensure message is not blank
        if (messageValue.trim() !== "") {
            setIsSending(true);
            sendMessage(messageValue, conversation_id, undefined);

            // Clear message box and message value
            messageBoxRef.current.clear();
            setMessageValue("");

            // Update typing status after message is sent and clear typing timeout
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
            updateTypingStatus(false, conversation_id);
        }
    }

    // Listen for typing updates
    useEffect(() => {
        const handle_user_typing = async (data: {
            user: string;
            conversation_id: string;
            typing: boolean
        }) => {
            if (data.user !== currentUser && data.conversation_id === conversation_id) {
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

    function handle_user_typing(text: string) {
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

    function handle_add_media() {
        // Toggle media options between show/hide
        setShowMediaOptions(!showMediaOptions);
    }

    // Get the position of the add media button from the right side of the screen
    // This is used to position the add media options menu
    useEffect(() => {
        if (addMediaButtonRef.current) {
            // Get the right position of the add media button
            addMediaButtonRef.current.measure((x, y, width, height, pageX, pageY) => { 
                const screenWidth = Dimensions.get('window').width; 
                const rightX = screenWidth - (pageX + width) - 10;

                setAddMediaOptionsRightPosition(rightX);
            });
        }
    }, [showMediaOptions]);
    
    function handleScrollToEnd() {
        if (!scrollViewRef.current) { return };
        scrollViewRef.current.scrollToEnd({ animated: true });
    }

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
            <Animated.View style={[
                styles.typing_indicator_container, {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }]}
            >
                <Text style={styles.typing_indicator}>{username} is typing...</Text>
            </Animated.View>
            <View style={styles.message_box}>
                <AddMediaOptions
                    showMediaOptions={showMediaOptions}
                    rightPosition={addMediaOptionsRightPosition}
                    handle_add_media={handle_add_media}
                    setShowGIFModal={setShowGIFModal}
                />
                <TextInput
                    ref={messageBoxRef}
                    style={styles.message_input}
                    placeholder={`Message ${username}`}
                    placeholderTextColor="#767676"
                    onFocus={() => setTimeout(() => handleScrollToEnd(), 300)}
                    onChangeText={text => handle_user_typing(text)}
                    keyboardAppearance="dark"
                />
                <View style={styles.controls}>
                    <TouchableOpacity ref={addMediaButtonRef} onPress={handle_add_media} disabled={isDisabled}>
                        <Image style={styles.send_button} source={require("../../assets/messages/add_media_button.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_message_send} disabled={isDisabled}>
                        <Image style={styles.send_button} source={require("../../assets/messages/send_button.png")} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}