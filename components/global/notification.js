import { useEffect, useState, useRef } from 'react';
import { Animated, View, Text, Image, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import styles from '../../styles/components/notification/style';
import getEnvVars from '../../variables';
import { eventEmitter } from '../../scripts/emitter';
import { useNavigation, useNavigationState } from '@react-navigation/native';

export default function NotificationBadge() {
    const [title, setTitle] = useState();
    const [content, setContent] = useState();
    const [showNotification, setShowNotification] = useState();
    const [conversationId, setConversationId] = useState();
    const slideAnim = useRef(new Animated.Value(-110)).current;
    const navigation = useNavigation();
    const currentRoute = useNavigationState(state => state?.routes[state.index]);

    useEffect(() => {
        console.log(currentRoute);
    }, [currentRoute]);

    function handle_show_notification(event) {
        console.log("notification event called");
        setTitle(event.title);
        setContent(event.content);
        setConversationId(event.conversation_id);

        // Check if the current route is set
        if (currentRoute) {
            // Check if conversation id is not the same as the current conversation
            // Also check if the current route is not the messages page
            if (currentRoute.name === 'Messages') {
                if (event.conversation_id !== currentRoute.params.conversation_id) {
                    setShowNotification(true);
                } else {
                    console.log("Conversation is already open");
                    // Do not show notification if the conversation is already open
                    return;
                }
            } else {
                setShowNotification(true);
            }
        } else {
            console.log("Current route is not set");
            // Do not show notification if the current route is not set
            return;
        }

        // Play slide-in animation
        Animated.spring(slideAnim, { 
            toValue: 30,
            friction: 7, // Adjust to make the bounce effect more noticeable 
            useNativeDriver: true, // Use native driver for better performance 
        }).start();

        setTimeout(() => {
            // Play slide-out animation 
            Animated.timing(slideAnim, { 
                toValue: -110,
                duration: 100, // Duration of the animation in milliseconds 
                useNativeDriver: true, // Use native driver for better performance 
            }).start(() => { 
                // This callback will be executed after the animation completes 
                setShowNotification(false); 
            });
        }, 5000);
    }

    useEffect(() => {
        eventEmitter.on('Show_Notification', handle_show_notification);

        return () => {
            eventEmitter.off('Show_Notification', handle_show_notification);
        }
    }, []);

    function handle_click() {
        setShowNotification(false);

        navigation.reset({
            index: 1, // Sets the second page as the current page
            routes: [
                {name: 'Main'},
                {
                    name: 'Messages',
                    params: {
                        username: title,
                        conversation_id: conversationId,
                        online: false
                    }
                }
            ]
        });        
    }

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: slideAnim } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            if (nativeEvent.translationY < 10) {
                Animated.spring(slideAnim, {
                    toValue: -110,
                    useNativeDriver: true
                }).start(() => setShowNotification(false));
            } else {
                Animated.spring(slideAnim, {
                    toValue: 30,
                    useNativeDriver: true
                }).start();
            }
        }
    };

    // Do not show notification if it is not set
    if (!showNotification) { return null;}

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View style={[styles.notification_container, { transform: [{ translateY: slideAnim }] }]}>
                <TouchableOpacity style={styles.notification} onPress={handle_click}>
                    <View>
                        <Image
                            source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${title}.png` }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.notification_content}>
                        <Text style={styles.notification_title}>{title}</Text>
                        <Text style={styles.notification_text}>{content}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </PanGestureHandler>
    );
}