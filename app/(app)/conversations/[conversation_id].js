import {
    ActivityIndicator,
    View,
    Text,
    Image,
    StatusBar,
    TouchableOpacity,
    ScrollView 
} from "react-native";
import styles from "@styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "@scripts/websocket_handler";
import { eventEmitter } from "@scripts/emitter";
import MessageBox from "@components/messages page/message_box";
import GIFModal from '@components/messages page/gif_modal';
import Message from "@components/messages page/message";
import { useUserData } from "@scripts/user_data_provider";
import { useLocalSearchParams } from "expo-router";
import { secureGet } from "@scripts/secure_storage";
import { useRouter } from "expo-router";
import { useConversationData } from "@scripts/conversation_data_provider";
import { useCache } from "@scripts/cache_provider";
import ConversationHeader from "@components/messages page/conversation_header";
import MessagesListLoading from "@components/messages page/messages_list_loading";

export default function MessagesPage() {
    // Get conversation from URL
    const { conversation_id } = useLocalSearchParams({ conversation_id });

    const scrollViewRef = useRef();
    const { sendMessage, updateTypingStatus } = useWebSocket();
    const [messageValue, setMessageValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [loadMoreMessages, setLoadMoreMessages] = useState(false);
    const currentScrollPosition = useRef(0);
    const currentScrollHight = useRef(0);
    const previousScrollHight = useRef(0);
    const [showGIFModal, setShowGIFModal] = useState(false);
    const [keepScrollPosition, setKeepScrollPosition] = useState(false);
    const { update_last_sent_message } = useUserData();

    const {
        setConversationData, 
        setMessages, 
        messages,
        isLoading, 
        setIsLoading,
        conversationName,
        clearConversationData,
        addMessages,
        setShowLoader
    } = useConversationData();

    const { addMessagesCache, getMessagesCache } = useCache();

    const router = useRouter();

    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

    // Configure styles for header bar
    useEffect(() => {
        let header_color;

        // Change header color if GIF modal is open
        if (showGIFModal) {
            header_color = '#0e0a07';   
        } else {
            header_color = '#19120E';
        }
    }, [showGIFModal]);

    function handle_navigation_back() {
        router.back();
    }

    useEffect(() => {
        async function load_messages() {
            // Set loading state
            setIsLoading(true);

            // Check if there are any cached messages for this conversation
            const cachedMessages = getMessagesCache(conversation_id);
            if (cachedMessages) {
                setConversationData(cachedMessages.conversationName, conversation_id);
                setMessages(cachedMessages.messages);
                setIsLoading(false);
            } else {
                setShowLoader(true);
            }

            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Fetch friends from server
            const response = await fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/load_messages/${conversation_id}`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token,
                    version: "2.0"
                }
            });

            if (response.ok) {
                // Parse response
                const data = await response.json();

                // Extract data from response
                const conversationName = data.conversation_name;
                const messages = data.messages;

                // Set conversation data
                setConversationData(conversationName, conversation_id);

                // Determine if there are more messages to load
                // This will load more messages when the user scrolls to the top of the conversation
                if (messages.length >= 20) {
                    setLoadMoreMessages(true);
                }

                // Set loading state to false
                setIsLoading(false);
                setShowLoader(false);

                // Set messages
                setMessages(messages);

                // Scroll to end of conversation
                // Set timeout to ensure messages load before scrolling
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: false });
                    }
                }, 1);

                // Add messages to cache
                addMessagesCache(conversation_id, conversationName, messages);

                // Update last sent message
                if (data.length >= 1) {
                    const data_index = data.length - 1;
                    const last_message = data[data_index];

                    update_last_sent_message(
                        last_message.Author,
                        last_message.Message,
                        conversation_id
                    );
                }
            } else {
                setMessages("Messages_Error");
            }
        }
        load_messages();

        // Clear conversation data when component unmounts
        return () => {
            clearConversationData();
        }
    }, []);

    // Scroll to end of conversation when messages change
    useEffect(() => {
        // Scroll to end of conversation
        // Set timeout to ensure messages load before scrolling
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        }, 1);  
    }, [messages]);

    // Add event listener for message send event
    useEffect(() => {
        const handle_message_sent = () => {
            setIsSending(false);
        }

        eventEmitter.on("Message_Sent", handle_message_sent);

        return () => {
            eventEmitter.off("Message_Sent", handle_message_sent);
        }
    });

    async function handle_scroll(event) {
        // Disable if conversation is loading
        if (isLoading) return;

        const scrollPosition = event.nativeEvent.contentOffset.y;
        currentScrollPosition.current = scrollPosition;
        
        if (scrollPosition <= 0  && !isLoadingMoreMessages && messages.length >= 20 && loadMoreMessages) {
            setIsLoadingMoreMessages(true);

            // Fetch auth credentials
            const credentials = await get_auth_credentials();

            // Fetch messages from server
            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/load_messages/${conversation_id}?offset=${messages.length}`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something Went Wrong");
                }
            })
            .then((data) => {
                // Save current scroll height
                previousScrollHight.current = currentScrollHight.current;

                // Add messages to list
                addMessages(conversation_id, data, true);

                // Wait 1ms for the content to load
                setTimeout(() => {
                    // Calculate new scroll pos to keep it the same
                    const newScrollPos = currentScrollHight.current - previousScrollHight.current;
                    console.log("current scroll:",currentScrollHight);
                    console.log("prev scroll:",previousScrollHight);
                    scrollViewRef.current.scrollTo({
                        x: 0,
                        y: newScrollPos,
                        animated: false
                    });
                }, 1);

                // Set loading state to false
                setIsLoadingMoreMessages(false);

                // Check if there are more messages to load
                if (data.length < 20) {
                    setLoadMoreMessages(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setIsLoadingMoreMessages(false);
            })
        }
    }

    function handle_content_size_change(width, height) {
        currentScrollHight.current = height;
        return;
        // If conversation is loading more messages then don't scroll
        // If keep scroll position is false then don't scroll
        if (!isLoadingMoreMessages && keepScrollPosition) {
            // Save previous scroll height
            previousScrollHight.current = currentScrollHight.current;

            // Save current scroll height
            currentScrollHight.current = height;

            // Scroll to end of conversation
            // Set timeout to ensure messages load before scrolling
            setTimeout(() => {
                if (scrollViewRef.current) {
                    // Calculate scroll position
                    const new_scroll_position = currentScrollHight.current - previousScrollHight.current + currentScrollPosition.current - 50; // Subtract 50 to move it up a bit so the user can see the new messages

                    scrollViewRef.current.scrollTo({ x: 0, y: new_scroll_position, animated: false });
                }
            }, 1);

            // Set keep scroll position to false
            setKeepScrollPosition(false);
        }
    }

    // Handle dismissing the GIF modal
    function onDismiss() {
        setShowGIFModal(false);
    }

    return (
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.header_left_container}>
                    <TouchableOpacity onPress={handle_navigation_back}>
                        <Image style={styles.back_button} source={require("@assets/messages/back_icon.png")} />
                    </TouchableOpacity>
                    <ConversationHeader />
                </View>
            </View>
            <ScrollView 
                contentContainerStyle={styles.messages_viewer}
                ref={scrollViewRef}
                onScroll={handle_scroll}
                onContentSizeChange={handle_content_size_change}
            >
                {isLoadingMoreMessages ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ): null}
                {Array.isArray(messages) && !isLoading ? (
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            message={message}
                            index={index}
                        />
                    ))
                ) : isLoading ? (
                    <MessagesListLoading />
                ) : (
                    <Text>Error Loading messages</Text>
                )}
            </ScrollView>
            <MessageBox
                isSending={isSending}
                username={conversationName}
                setMessageValue={setMessageValue}
                sendMessage={sendMessage}
                conversation_id={conversation_id}
                messageValue={messageValue}
                setIsSending={setIsSending}
                scrollViewRef={scrollViewRef}
                updateTypingStatus={updateTypingStatus}
                setShowGIFModal={setShowGIFModal}
            />
            <GIFModal
                showGIFModal={showGIFModal}
                onDismiss={onDismiss}
                conversation_id={conversation_id}
            />
        </View>
    )
}