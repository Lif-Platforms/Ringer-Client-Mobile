import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

type JumpToRecentButtonProps = {
    onPress: () => void;
    showButton: boolean;
}

export default function JumpToRecentButton({ onPress, showButton }: JumpToRecentButtonProps) {
    if (!showButton) return null;

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <AntDesign name="arrowdown" size={24} color="black" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'white',
        borderRadius: 100,
        padding: 10,
        position: 'absolute',
        bottom: 140,
        right: 20,
    }
})