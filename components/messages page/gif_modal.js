import { View, TextInput, Animated, Dimensions, Text } from "react-native";
import styles from "../../styles/messages/gif_modal";
import { useEffect, useRef, useState } from "react";
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler';
import GIFList from "./gif_list";
import GIFSendButton from "./gif_send_button";

export default function GIFModal({ showGIFModal, onDismiss, conversation_id }) {
    const modalRef = useRef();
    const flyAnimation = useRef(new Animated.Value(0)).current; // will be updated later
    const searchRef = useRef();

    // Get the screen height
    const screenHeight = Dimensions.get('window').height; 
    const modalHeight = screenHeight * 0.85; // Calculate 90% of the screen height

    // Store search query text
    const [queryText, setQueryText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Handle GIF selection
    const [gifToSend, setGifToSend] = useState({url: null, id: null, title: null});

    // Play fly in animation when modal opens
    useEffect(() => {
        if (showGIFModal) {
            // Set initial animation value
            flyAnimation.setValue(modalHeight);

            // Play fly in animation
            Animated.spring(flyAnimation, { 
                toValue: 0,
                tension: 20,
                friction: 10,
                useNativeDriver: true, 
            }).start();

            // Wait for animation to play before focusing
            setTimeout(() => {
                searchRef.current.focus();
            }, 300);
        }
    }, [showGIFModal]);

    const handleGesture = Animated.event( 
        [{ nativeEvent: { translationY: flyAnimation } }], 
        { useNativeDriver: true } 
    );

    const handleGestureEnd = (event) => {
        if (event.nativeEvent.translationY > modalHeight / 2) { 
            // If dragged more than half of the modal height, dismiss the modal 
            Animated.timing(flyAnimation, { 
                toValue: modalHeight, 
                duration: 200, 
                useNativeDriver: true, 
            }).start(() => { 
                if (onDismiss) { 
                    onDismiss(); 
                } 
            }); 
        } else { 
            // Otherwise, reset the position 
            Animated.spring(flyAnimation, { 
                toValue: 0, 
                tension: 20, 
                friction: 10, 
                useNativeDriver: true, 
            }).start(); 
        } 
    };

    // Reset search query and selected GIF when modal is closed
    useEffect(() => {
        if (!showGIFModal) {
            setSearchQuery("");
            setGifToSend({url: null, id: null, title: null});
        }
    }, [showGIFModal]);

    if (showGIFModal) {
        return (
            <View style={styles.modal_container}>
                <PanGestureHandler 
                    onGestureEvent={handleGesture}
                    onHandlerStateChange={handleGestureEnd}
                >
                    <Animated.View 
                        style={[styles.modal, {
                            height: modalHeight, 
                            transform: [
                                {translateY: flyAnimation}
                            ]}
                        ]} 
                        ref={modalRef}
                    >
                        <View style={styles.bar} />
                        <View style={styles.search_bar_container}>
                            <TextInput
                                keyboardAppearance="dark"
                                style={styles.search_bar}
                                placeholder="Search GIPHY"
                                placeholderTextColor="#828282"
                                ref={searchRef}
                                returnKeyType="search"
                                onChangeText={(text) => setQueryText(text)}
                                onSubmitEditing={() => setSearchQuery(queryText)}
                            />
                        </View>
                        <GIFList 
                            search_query={searchQuery} 
                            gifToSend={gifToSend}
                            setGifToSend={setGifToSend}
                        />
                        <GIFSendButton
                            gifToSend={gifToSend}
                            conversation_id={conversation_id}
                            onDismiss={onDismiss}
                            flyAnimation={flyAnimation}
                        />
                    </Animated.View>
                </PanGestureHandler>
            </View>
        )
    }
}