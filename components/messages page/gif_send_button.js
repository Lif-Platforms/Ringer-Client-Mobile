import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, Dimensions } from 'react-native';
import styles from '../../styles/messages/gif_send_button';
import { useWebSocket } from '../../scripts/websocket_handler';

export default function GIFSendButton({
    gifToSend,
    conversation_id,
    onDismiss,
    flyAnimation,
}) {
    const translateY = useRef(new Animated.Value(100)).current;
    const { sendMessage } = useWebSocket();

    // Get screen height for animating the modal off the screen later
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        if (gifToSend.url) {
            Animated.spring(translateY, { 
                toValue: 0, 
                tension: 50, // Adjust tension for bounce effect 
                friction: 8, // Adjust friction for bounce effect 
                useNativeDriver: true, 
            }).start();
        } else {
            translateY.setValue(100);
        }
    }, [gifToSend]);

    function handle_send() {
        sendMessage("GIF Message", conversation_id, gifToSend.url);

        // Animate the dismissal of the GIF modal
        Animated.timing(flyAnimation, { 
            toValue: screenHeight, 
            duration: 250, 
            useNativeDriver: true, 
        }).start(() => {
            // Dismiss the GIF modal
            onDismiss();
        });
    }

    return (
        <Animated.View style={[styles.buttonContainer, { transform: [{ translateY }] }]}>
            <TouchableOpacity style={styles.button} onPress={handle_send}>
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};