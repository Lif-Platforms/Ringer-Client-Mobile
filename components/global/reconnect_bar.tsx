import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "@providers/websocket_handler";
import styles from "@styles/components/reconnect_bar/style";
import { Text, Animated } from "react-native";

export default function ReconnectBar() {
    const { isConnected, shouldReconnect } = useWebSocket();
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [visible, setVisible] = useState(false);
    const topValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isConnected && shouldReconnect) {
            reconnectTimeout.current = setTimeout(() => {
                setVisible(true);
            }, 4000);
        } else {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            setVisible(false);
        }

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            setVisible(false);
        };
    }, [isConnected]);

    // Handle animations
    useEffect(() => {
        if (visible) {
            Animated.timing(topValue, {
                toValue: 110,
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