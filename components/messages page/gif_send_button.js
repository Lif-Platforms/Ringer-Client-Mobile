import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, Dimensions } from 'react-native';
import styles from '../../styles/messages/gif_send_button';
import { useWebSocket } from '@providers/websocket_handler';

export default function GIFSendButton({
    gifToSend,
    conversation_id,
    onDismiss,
    flyAnimation,
}) {
    const scale = useRef(new Animated.Value(0.8)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const { sendMessage } = useWebSocket();

    // Get screen height for animating the modal off the screen later
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        if (gifToSend.url) {
            const scaleAnimation = Animated.timing(scale, { 
                toValue: 1,
                duration: 150, 
                useNativeDriver: true, 
            });
            const opacityAnimation = Animated.timing(opacity, { 
                toValue: 1,
                duration: 150, 
                useNativeDriver: true, 
            });
            Animated.parallel([scaleAnimation, opacityAnimation]).start();
        } else {
            scale.setValue(0.8);
            opacity.setValue(0);
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

    // If there is no GIF to send, return null
    if (!gifToSend.url) { return null; }

    return (
        <Animated.View style={[styles.buttonContainer, { opacity }]}>
            <TouchableOpacity 
                style={[styles.button, { 
                    transform: [{ scale }]
                }]} 
                onPress={handle_send}
            >
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};