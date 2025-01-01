import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#ff9500',
        paddingVertical: 10,
        borderRadius: 25,
        width: "90%",
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5, // Android
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default styles;