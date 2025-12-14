import { Animated } from 'react-native';
import { useRef, useEffect } from 'react';

type SkeletonLoaderPropsType = {
    width?: number | `${number}%`;
    height?: number | `${number}%`;
    borderRadius?: number;
}

export default function SkeletonLoader({ width, height, borderRadius } : SkeletonLoaderPropsType) {

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
            width: width !== undefined ? width : '100%',
            height: height !== undefined ? height : '100%',
            backgroundColor: '#272727',
            borderRadius: borderRadius !== undefined ? borderRadius : 8,
            opacity: pulseAnim,
        }} />
    );
}
