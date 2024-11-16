import { useEffect, useState, useRef } from 'react';
import { Animated, View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../../styles/components/notification/style';
import getEnvVars from '../../variables';
import { eventEmitter } from '../../scripts/emitter';

export default function NotificationBadge({ navigation }) {
    const [title, setTitle] = useState();
    const [content, setContent] = useState();
    const [showNotification, setShowNotification] = useState();
    const [conversationId, setConversationId] = useState();
    const slideAnim = useRef(new Animated.Value(-50)).current;

    function handle_show_notification(event) {
        setTitle(event.title);
        setContent(event.content);
        setShowNotification(true);
        setConversationId(event.conversation_id);

        // Play slide-in animation
        Animated.spring(slideAnim, { 
            toValue: 0,
            friction: 7, // Adjust to make the bounce effect more noticeable 
            useNativeDriver: true, // Use native driver for better performance 
        }).start();

        setTimeout(() => {
            // Play slide-out animation 
            Animated.timing(slideAnim, { 
                toValue: -50,
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

    if (showNotification) {
        return (
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
        );
    }
}