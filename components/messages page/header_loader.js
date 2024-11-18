import styles from "../../styles/messages/headerLoader";
import { View, Dimensions, Animated } from "react-native";
import { useRef, useEffect } from 'react';

export default function HeaderLoader({ isSending }) {
    const slideAnimation = useRef(new Animated.Value(0)).current;
    const loaderShowTimeout = useRef();

    useEffect(() => {
        const slide = Animated.timing(slideAnimation, {
            toValue: Dimensions.get('window').width - 50, // Make the loader slide to almost complete until message sends or times out
            duration: 2000,
            useNativeDriver: false
        });

        if (isSending) {
            // Give time for message to send before showing loader
            loaderShowTimeout.current = setTimeout(() => {
                slide.start();
            }, 1000);
        } else {
            clearTimeout(loaderShowTimeout.current);
            slide.stop();
            if (slideAnimation && slideAnimation.__getValue() !== 0) {
                // Play complete animation
                Animated.timing(slideAnimation, {
                    toValue: Dimensions.get('window').width,
                    duration: 100,
                    useNativeDriver: false
                }).start(() => {
                    slideAnimation.setValue(0); // Reset animation when isSending is false
                });
            } else if (slideAnimation) {
                slideAnimation.setValue(0); // Reset animation when isSending is false
            }
        }

        return () => clearTimeout(loaderShowTimeout.current);
    }, [isSending]);

    return (
        <Animated.View style={[styles.header_loader, {width: slideAnimation}]} />
    )
}