import { View, Image, TouchableOpacity, Text, Animated } from "react-native";
import styles from "../../../styles/user_profile/header";
import { useEffect, useRef } from "react";

export function Header({ navigation, username, headerMode }) {
    const slideAnim = useRef(new Animated.Value(-30)).current; // Initial position for sliding 
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity

    function handle_navigation_back() {
        navigation.goBack();
    }

    // Play header animations based on mode
    useEffect(() => {
        const animation_parallel = Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, // Slide to its original position 
                duration: 250, // Duration of the slide animation 
                useNativeDriver: true, // Use native driver for better performance 
            }),
            Animated.timing(fadeAnim, {
                toValue: 1, // Fade in to full opacity 
                duration: 250, // Duration of the fade animation 
                useNativeDriver: true, // Use native driver for better performance 
            }),
        ])

        if (headerMode === 1) {
            animation_parallel.start();
        } else {
            // Reset animation values when header changes back to mode 0
            slideAnim.setValue(-30); 
            fadeAnim.setValue(0);
        }
    }, [headerMode]);

    return (
        <View style={[styles.header, { backgroundColor: headerMode === 1 ? "#160900d2" : null }]}>
            <TouchableOpacity style={styles.back_button} onPress={handle_navigation_back}>
                <Image
                    source={require('../../../assets/user_profile/back_icon.png')}
                />
            </TouchableOpacity>
            {headerMode === 1 ? (
                <Animated.View style={[styles.user_info, {transform: [{ translateX: slideAnim }], opacity: fadeAnim}]}>
                    <Image
                        source={{uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png`}}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>{username}</Text>
                </Animated.View>
            ) : null}
        </View>
    )
}