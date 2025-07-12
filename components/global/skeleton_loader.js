import { Animated } from 'react-native';
import { useRef, useEffect } from 'react';

export default function SkeletonLoader({ width, height, borderRadius, }) {

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <Animated.View style={{
            width: width || '100%',
            height: height || '100%',
            backgroundColor: '#272727',
            borderRadius: borderRadius || 8,
            opacity: pulseAnim,
        }} />
    );
}
