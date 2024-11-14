import { ActivityIndicator, Keyboard, View, Text, Image, StatusBar, Dimensions, ScrollView, Alert, Platform } from "react-native";
import styles from "../styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import getEnvVars from "../variables";
import SlidingUpPanel from 'rn-sliding-up-panel';
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import { eventEmitter } from "../scripts/emitter";
import MessageBox from "../components/messages page/message_box";

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

export function MessagesPage({ route, navigation }) {
    const { username, conversation_id, online } = route.params;
    const [userPronouns, setUserPronouns] = useState("Loading...");
    const [userBio, setUserBio] = useState("Loading...");
    const [messages, setMessages] = useState("loading");
    const scrollViewRef = useRef();
    const { sendMessage, updateTypingStatus } = useWebSocket();
    const [messageValue, setMessageValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUnfriending, setIsUnfriending] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const panelRef = useRef();
    const [showPanel, setShowPanel] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [loadMoreMessages, setLoadMoreMessages] = useState(false);
    const currentScrollPosition = useRef(0);
    const currentScrollHight = useRef(0);
    const previousScrollHight = useRef(0);

    // Set online status when page loads
    useEffect(() => {
        setIsOnline(online);
    }, []);

    async function get_auth_credentials() {
        const username_ = await getValueFor("username");
        const token_ = await getValueFor("token");

        return { username: username_, token: token_ };
    }

    // Listen for keyboard events
    useEffect(() => {
        const keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        }
    }, []);

    // Configure styles for header bar
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: '#19120E',
                height: 55,
                shadowColor: 'transparent'
            }
        });    
    }, [navigation]);

    function handle_navigation_back() {
        navigation.goBack();
    }

    useEffect(() => {
        async function fetch_pronouns() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_pronouns/${username}`);
    
            if (response.ok) {
                const pronouns = (await response.text()).slice(1, -1);
                setUserPronouns(pronouns);
            } else {
                console.error("Pronouns Request Failed! Status code: " + response.status)
                setUserPronouns("Error Fetching Pronouns");
            }
        }
        fetch_pronouns();
    }, []);

    useEffect(() => {
        async function fetch_bio() {
            const response = await fetch(`${getEnvVars.auth_url}/profile/get_bio/${username}`);
    
            if (response.ok) {
                const bio = (await response.text()).slice(1, -1);
                setUserBio(bio);
            } else {
                console.error("Bio Request Failed! Status code: " + response.status)
                setUserBio("Error Fetching Bio");
            }
        }
        fetch_bio();
    }, []);

    useEffect(() => {
        async function load_messages() {
            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Fetch friends from server
            const response = await fetch(`${getEnvVars.ringer_url}/load_messages/${conversation_id}`, {
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.length >= 20) {
                    setLoadMoreMessages(true);
                }
                setMessages(data);

                // Scroll to end of conversation
                // Set timeout to ensure messages load before scrolling
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: false });
                    }
                }, 1);  
            } else {
                setMessages("Messages_Error");
            }
        }
        load_messages();
    }, []);

    // Add event listener for message updates
    useEffect(() => {
        const handle_message_update = (event) => {
          // Check if the update was for this conversation
          if (event.id === conversation_id) {
            // Use functional state update to ensure the latest state is used
            setMessages((prevMessages) => [...prevMessages, event.message]);

            // Scroll to end of conversation
            // Set timeout to ensure messages load before scrolling
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
            }, 1);  
          }
        };
    
        // Add the event listener
        eventEmitter.on('Message_Update', handle_message_update);
    
        // Cleanup function to remove the event listener
        return () => {
          eventEmitter.off('Message_Update', handle_message_update);
        };
    }, []);

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

    function handle_unfriend() {
        async function unfriend_user(setIsUnfriending, conversation_id, navigation) {
            setIsUnfriending(true);

            // Get auth credentials
            const credentials = await get_auth_credentials();

            // Make request to server
            fetch(`${getEnvVars.ringer_url}/remove_conversation/${conversation_id}`, {
                method: "DELETE",
                headers: {
                    username: credentials.username,
                    token: credentials.token
                }
            })
            .then((response) => {
                if (response.ok) {
                    Alert.alert(
                        "Success",
                        "You unfriended this user.",
                        [
                            {
                                text: "Ok",
                                onPress: () => navigation.reset({index: 0, routes: [{name: 'Main'}]})
                            }
                        ]
                    );
                } else {
                    throw new Error("Request failed with status code: " + response.status);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Failed", "Something went wrong while attempting this action.")
                setIsUnfriending(false);
            })
        }

        Alert.alert(
            "Unfriend User?",
            "You will no longer be able to send or receive messages from this user.",
            [
                {
                    text: "Cancel"
                },
                {
                    text: "Yes, Do it",
                    onPress: () => unfriend_user(setIsUnfriending, conversation_id, navigation)
                }
            ],
            {cancelable: true}
        )
    }
    
    function handle_user_report() {
        function submit_report(reason, username, content, setIsReporting) {
            setIsReporting(true);

            // Create form data for request
            const formData = new FormData();
            formData.append("user", username);
            formData.append("reason", reason);
            formData.append("service", "Ringer");

            // Format messages for report
            let report_content = "";

            content.forEach(message => {
                report_content += `[${message.Author}]\n${message.Message}\n\n`;
            });

            // Add content to form data
            formData.append("content", report_content);

            // Make request to server
            fetch(`${getEnvVars.auth_url}/account/report`, {
                method: "POST",
                body: formData
            })
            .then((response) => {
                if (response.ok) {
                    setIsReporting(false);
                    Alert.alert("Done", "Your report has been sent to Lif Platforms for evaluation.");
                } else {
                    throw new Error("Request failed with status code: " + response.status);
                }
            })
            .catch((error) => {
                console.error(error);
                setIsReporting(false);
                Alert.alert("Report Failed", "Something went wrong when submitting your report. Try again later.");
            })
        }

        if (Platform.OS === "ios") {
            Alert.prompt(
                'Report User',
                'Please specify the reason for your report.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: (text) => submit_report(text, username, messages, setIsReporting),
                    },
                ],
                'plain-text'
            );
        } else {
            Alert.alert("Sorry", "This feature isn't available on Android yet.")
        }
    }

    function handle_more_panel_open() {
        setShowPanel(true);

        // Check if keyboard is visible
        // If so, dismiss it
        if (isKeyboardVisible) {
            Keyboard.dismiss();
        }
      
        const checkPanelRef = () => {
          if (panelRef.current) {
            panelRef.current.show({ toValue: Dimensions.get('window').height / 2 });
          } else {
            setTimeout(checkPanelRef, 1); // Check again after 1ms
          }
        };
        checkPanelRef();
    }

    // Listen for online status update
    useEffect(() => {
        const handle_status_change = (data) => {
            if (data.user === username) {
                setIsOnline(data.online);
            }
        }

        eventEmitter.on('User_Status_Update', handle_status_change);

        return () => {
            eventEmitter.off('User_Status_Update', handle_status_change);
        }
    }, []);

    async function handle_scroll(event) {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        currentScrollPosition.current = scrollPosition;
        
        if (scrollPosition <= 0  && !isLoadingMoreMessages && messages.length >= 20 && loadMoreMessages) {
            setIsLoadingMoreMessages(true);

            // Fetch auth credentials
            const credentials = await get_auth_credentials();

            // Fetch messages from server
            fetch(`${getEnvVars.ringer_url}/load_messages/${conversation_id}?offset=${messages.length}`, {
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
                // Add messages to list
                const messages_ = [...data, ...messages];
                setMessages(messages_);
                setIsLoadingMoreMessages(false);

                if (data.length < 20) {
                    setLoadMoreMessages(false);
                }

                // Scroll to end of conversation
                // Set timeout to ensure messages load before scrolling
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollTo({ x: 0, y: currentScrollHight.current - previousScrollHight.current, animated: false });
                    }
                }, 0);  
            })
            .catch((err) => {
                console.error(err);
                setIsLoadingMoreMessages(false);
            })
        }
    }

    function handle_content_size_change(width, height) {
        previousScrollHight.current = currentScrollHight.current || height;
        currentScrollHight.current = height;
    }

    return (
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.header_left_container}>
                    <TouchableOpacity onPress={handle_navigation_back}>
                        <Image style={styles.back_button} source={require("../assets/messages/back_icon.png")} />
                    </TouchableOpacity>
                    <View>
                        <Image
                            source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }}
                            style={styles.header_avatar}
                        />
                        <View style={[styles.status_indicator, {backgroundColor: isOnline ? 'lightgreen' : 'gray'}]} />
                    </View>
                    <Text style={styles.conversation_user}>{username}</Text>
                </View>
                <TouchableOpacity style={styles.more_icon_container} onPress={handle_more_panel_open}>
                    <Image style={styles.more_icon} source={require("../assets/messages/more_icon.png")} />
                </TouchableOpacity>
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
                {Array.isArray(messages) ? (
                    messages.map((message, index) => (
                        <View key={index} style={styles.message}>
                            <Image
                                source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${message.Author}.png` }}
                                style={styles.message_avatar}
                            />
                            <View style={styles.message_text_container}>
                                <Text style={styles.messages_author}>{message.Author}</Text>
                                <Text style={styles.messages_content} selectable={true}>{message.Message}</Text>
                            </View>
                        </View>
                    ))
                ) : messages === "loading" ? (
                    <Text style={styles.message_loading}>Loading...</Text>
                ) : (
                    <Text>Error Loading messages</Text>
                )}
            </ScrollView>
            <MessageBox
                isSending={isSending}
                username={username}
                setMessageValue={setMessageValue}
                sendMessage={sendMessage}
                conversation_id={conversation_id}
                messageValue={messageValue}
                setIsSending={setIsSending}
                scrollViewRef={scrollViewRef}
                updateTypingStatus={updateTypingStatus}
            />
            {showPanel && (
                <SlidingUpPanel 
                    ref={panelRef} 
                    snappingPoints={[Dimensions.get('window').height / 2]}
                    pointerEvents="auto"
                    onBottomReached={() => setShowPanel(false)}
                >
                    <View style={styles.more_panel} pointerEvents="box-none">
                        <Image style={styles.more_panel_banner} source={{uri: `${getEnvVars.auth_url}/profile/get_banner/${username}.png?timestamp=${new Date().getTime()}`}} />
                        <Image style={styles.more_panel_avatar} source={{uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png?timestamp=${new Date().getTime()}`}} />
                        <Text style={styles.more_panel_username}>{username}</Text>
                        <View style={styles.more_panel_info}>
                            <Text style={styles.more_panel_section_title}>Pronouns</Text>
                            <Text style={styles.more_panel_section}>{userPronouns}</Text>
                            <Text style={styles.more_panel_section_title}>Bio</Text>
                            <Text style={styles.more_panel_section}>{userBio}</Text>
                        </View>
                        <View style={styles.more_panel_bottom_buttons}>
                            <TouchableOpacity style={styles.more_panel_bottom_button} onPress={handle_unfriend}>
                                {isUnfriending ? (
                                    <Text style={styles.more_panel_bottom_button_text}>Unfriending...</Text>
                                ) : (
                                    <Text style={styles.more_panel_bottom_button_text}>Unfriend</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.more_panel_bottom_button} onPress={handle_user_report}>
                                {isReporting ? (
                                    <Text style={styles.more_panel_bottom_button_text}>Reporting...</Text>
                                ) : (
                                    <Text style={styles.more_panel_bottom_button_text}>Report</Text>
                                )}                        
                            </TouchableOpacity>
                        </View>
                    </View>
                </SlidingUpPanel>
            )}
        </View>
    )
}