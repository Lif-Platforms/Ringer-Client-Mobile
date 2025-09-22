import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View, StyleSheet } from 'react-native';

export default function MessagesLoadError() {
    return (
        <View style={styles.container}>
            <MaterialIcons
                name="error-outline"
                size={48}
                color="rgba(255, 255, 255, 0.6)"
                style={{ alignSelf: 'center', marginTop: 20 }}
            />
            <Text style={styles.errorText}>Failed to load messages</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 10,
    },
});