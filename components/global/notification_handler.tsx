import { useEffect, useRef } from 'react';
import { eventEmitter } from '../../scripts/emitter';
import { useNavigation, useNavigationState, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Notifier, Easing, NotifierComponents } from 'react-native-notifier';
import { Vibration } from 'react-native';

// Strongly-typed shape for notification events
type NotificationEvent = {
    title: string;
    content?: string;
    conversation_id?: string | number;
};

// Minimal route-like shape that we use from navigation state
type RouteViewing = {
    name: string;
    params?: {
        conversation_id?: string | number;
        [key: string]: any;
    } | undefined;
};

export default function NotificationHandler() {
    // Use a broad NavigationProp to satisfy the hook typings. We cast when calling
    // navigator-specific methods (like reset) where needed.
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    // Grab the current route from navigation state and cast to our lighter type
    const currentRoute = useNavigationState(state => state?.routes[state.index] as RouteViewing);
    const routeViewing = useRef<RouteViewing | null>(null);

    // Keep the ref in sync with the latest route
    useEffect(() => {
        routeViewing.current = currentRoute ?? null;
    }, [currentRoute]);

    function handle_show_notification(event: NotificationEvent) {
        // Show notification
        function show_notification(event: NotificationEvent) {
            Notifier.showNotification({
                title: event.title,
                description: event.content,
                duration: 5000,
                showAnimationDuration: 200,
                showEasing: Easing.linear,
                onPress: () => {
                    // reset is not universally present on the broad NavigationProp type
                    // so cast to any for this call. The runtime navigator (stack) will
                    // perform the reset as expected.
                    (navigation as any).reset({
                        index: 1, // Sets the second page as the current page
                        routes: [
                            { name: 'Main' },
                            {
                                name: 'Messages',
                                params: {
                                    username: event.title,
                                    conversation_id: event.conversation_id,
                                },
                            },
                        ],
                    });
                },
                hideOnPress: true,
                Component: NotifierComponents.Notification,
                componentProps: {
                    imageSource: { uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${event.title}.png` },
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

        // If we have information about the currently-viewed route, avoid
        // showing a notification for messages that belong to the conversation
        // that is already open.
        if (routeViewing.current) {
            if (routeViewing.current.name === 'Messages') {
                const currentConv = routeViewing.current.params?.conversation_id;
                if (event.conversation_id !== currentConv) {
                    show_notification(event);
                } else {
                    // Conversation is already open; don't show notification
                    console.log('Conversation is already open');
                    return;
                }
            } else {
                show_notification(event);
            }
        } else {
            // If we don't know the current route, err on the side of showing the
            // notification so the user sees incoming messages.
            show_notification(event);
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