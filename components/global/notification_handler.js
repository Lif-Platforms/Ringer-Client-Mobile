import { useEffect, useRef } from 'react';
import { eventEmitter } from '../../scripts/emitter';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Notifier, Easing, NotifierComponents } from 'react-native-notifier';
import getEnvVars from '../../variables';

export default function NotificationHandler() {
    const navigation = useNavigation();
    const currentRoute = useNavigationState(state => state?.routes[state.index]);
    const routeViewing = useRef();

    // Update the current route as it changes
    useEffect(() => {
        routeViewing.current = currentRoute;
    }, [currentRoute]);

    function handle_show_notification(event) {
        // Show notification
        function show_notification(event) {
            Notifier.showNotification({
                title: event.title,
                description: event.content,
                duration: 5000,
                showAnimationDuration: 200,
                showEasing: Easing.linear,
                onPress: () => {
                    navigation.reset({
                        index: 1, // Sets the second page as the current page
                        routes: [
                            {name: 'Main'},
                            {
                                name: 'Messages',
                                params: {
                                    username: event.title,
                                    conversation_id: event.conversation_id
                                }
                            }
                        ]
                    });
                },
                hideOnPress: true,
                Component: NotifierComponents.Notification,
                componentProps: {
                    imageSource: { uri: `${getEnvVars.auth_url}/profile/get_avatar/${event.title}.png` },
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
        }

        // Check if the current route is set
        if (routeViewing.current) {
            // Check if page is messages page
            if (routeViewing.current.name === "Messages") {
                // Check if the conversation id is not the same as the current conversation
                if (event.conversation_id !== routeViewing.current.params.conversation_id) {
                    // Show notification
                    show_notification(event);
                } else {
                    console.log("Conversation is already open");
                    // Do not show notification if the conversation is already open
                    return;
                }
            } else {
                // Show notification
                show_notification(event);
            }
        } else {
            console.log("Current route is not set");
        }
    }

    // Listen for notification events
    useEffect(() => {
        eventEmitter.on("show_notification", handle_show_notification);

        return () => {
            eventEmitter.off("show_notification", handle_show_notification);
        }
    }, []);

    return null;
}