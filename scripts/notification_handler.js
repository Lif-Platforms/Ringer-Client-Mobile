import { Notifier, Easing, NotifierComponents } from 'react-native-notifier';
import { Vibration } from 'react-native';
import { useRouter } from 'expo-router';

export function showNotification(username, conversationId, messageBody) {
    console.log("Showing notification for:", username, conversationId, messageBody);
    const router = useRouter();

    Notifier.showNotification({
        title: username,
        description: messageBody,
        duration: 5000,
        showAnimationDuration: 200,
        showEasing: Easing.linear,
        onPress: () => {
            // TODO: Fix this \/
            router.dismissAll();
            router.replace("/(app)/conversations/" + conversationId);
        },
        hideOnPress: true,
        Component: NotifierComponents.Notification,
        componentProps: {
            imageSource: { uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png` },
            imageStyle: { borderRadius: 100 },
            containerStyle: { 
                backgroundColor: '#1C1C1C',
                borderColor: '#353535',
                borderWidth: 1,
                borderRadius: 15,
            },
            titleStyle: { color: 'white' },
            descriptionStyle: { color: 'white' },
        }
    });

    // Vibrate the device
    Vibration.vibrate(1000);
}