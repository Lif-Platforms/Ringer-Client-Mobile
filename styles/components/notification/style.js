import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    notification_container: {
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        position: 'absolute',
        top: 20,
        zIndex: 999,
    },
    notification: { 
        backgroundColor: '#222222',
        borderRadius: 15,
        width: '100%',
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    notification_title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 100
    },
    notification_content: {
        marginLeft: 10,
        marginTop: 'auto',
        marginBottom: 'auto',
        maxWidth: '100%'
    },
    notification_text: {
        color: 'white',
        width: '100%',
        overflow: 'hidden',
        flexWrap: 'wrap',
        maxWidth: '100%'
    }
})

export default styles;