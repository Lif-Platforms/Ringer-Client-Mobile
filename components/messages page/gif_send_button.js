import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/messages/gif_send_button';

export default function GIFSendButton({ gifToSend }) {
    const translateY = useRef(new Animated.Value(100)).current;

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

    return (
        <Animated.View style={[styles.buttonContainer, { transform: [{ translateY }] }]}>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};