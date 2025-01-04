import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../scripts/websocket_handler";
import styles from "../../styles/components/reconnect_bar/style";
import { Text, Animated } from "react-native";

export default function ReconnectBar() {
    const { isConnected } = useWebSocket();
    const reconnectTimeout = useRef(null);
    const [visible, setVisible] = useState(false);
    const topValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isConnected) {
            reconnectTimeout.current = setTimeout(() => {
                setVisible(true);
            }, 4000);
        } else {
            clearTimeout(reconnectTimeout.current);
            setVisible(false);
        }

        return () => {
            clearTimeout(reconnectTimeout.current);
            setVisible(false);
        };
    }, [isConnected]);

    // Handle animations
    useEffect(() => {
        if (visible) {
            Animated.timing(topValue, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(topValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Animated.View style={[styles.reconnectBar, { transform: [{ translateY: topValue }] }]}>
            <Text style={styles.reconnectText}>Reconnecting...</Text>
        </Animated.View>
    );
}