import { View, TextInput, TouchableOpacity, Image, Animated, Keyboard } from "react-native";
import { useRef, useState, useEffect } from "react";
import styles from "../../styles/messages/messageBox";

export default function MessageBox({
    isSending,
    username,
    setMessageValue,
    setIsSending,
    conversation_id,
    sendMessage,
    messageValue,
    scrollViewRef
}) {
    const messageBoxRef = useRef();
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [bottomPadding, setBottomPadding] = useState(40);

    function handle_message_send() {
        setIsSending(true);
        sendMessage(messageValue, conversation_id);

        // Clear message box
        messageBoxRef.current.clear();
    }

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
            <TextInput
                style={styles.message_box}
                ref={messageBoxRef}
                placeholder={`Message ${username}`}
                placeholderTextColor="#767676"
                onFocus={() => setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 300)}
                onChangeText={text => setMessageValue(text)}
                editable={!isSending}
            />
            <TouchableOpacity onPress={handle_message_send} disabled={isSending}>
                <Image style={styles.send_button} source={require("../../assets/messages/send_button.png")} />
            </TouchableOpacity>
        </Animated.View>
    );
}