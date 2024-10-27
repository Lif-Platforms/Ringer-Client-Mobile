import { Keyboard, View, Text, Image, StatusBar, Dimensions, TextInput, KeyboardAvoidingView, ScrollView, Alert, Platform } from "react-native";
import styles from "../styles/messages/style";
import { useEffect, useState, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import getEnvVars from "../variables";
import SlidingUpPanel from 'rn-sliding-up-panel';
import * as SecureStore from 'expo-secure-store';
import { useWebSocket } from "../scripts/websocket_handler";
import { eventEmitter } from "../scripts/emitter";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    const { username, conversation_id } = route.params;
    const [userPronouns, setUserPronouns] = useState("Loading...");
    const [userBio, setUserBio] = useState("Loading...");
    const [messages, setMessages] = useState("loading");
    const scrollViewRef = useRef();
    const { sendMessage } = useWebSocket();
    const [messageValue, setMessageValue] = useState("");
    const messagebox_ref = useRef();
    const [isSending, setIsSending] = useState(false);
    const [isUnfriending, setIsUnfriending] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const panelRef = useRef();
    const [showPanel, setShowPanel] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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
        async function get_friends() {
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
                setMessages(await response.json());
            } else {
                setMessages("Messages_Error");
            }
        }
        get_friends();
    }, []);

    function handle_message_send() {
        setIsSending(true);
        sendMessage(messageValue, conversation_id);

        // Clear message box
        messagebox_ref.current.clear();
    }

    // Add event listener for message updates
    useEffect(() => {
        const handle_message_update = (event) => {
          // Check if the update was for this conversation
          if (event.id === conversation_id) {
            // Use functional state update to ensure the latest state is used
            setMessages((prevMessages) => [...prevMessages, event.message]);
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
            setTimeout(checkPanelRef, 1); // Check again after 100ms
          }
        };
        checkPanelRef();
    }

    return (
        <View style={styles.page}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.header_left_container}>
                    <TouchableOpacity onPress={handle_navigation_back}>
                        <Image style={styles.back_button} source={require("../assets/messages/back_icon.png")} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }}
                        style={styles.header_avatar}
                    />
                    <Text style={styles.conversation_user}>{username}</Text>
                </View>
                <TouchableOpacity style={styles.more_icon_container} onPress={handle_more_panel_open}>
                    <Image style={styles.more_icon} source={require("../assets/messages/more_icon.png")} />
                </TouchableOpacity>
            </View>
            <ScrollView 
                contentContainerStyle={styles.messages_viewer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}
            >
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
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.message_bar_container}>
                    <TextInput
                        style={styles.message_box}
                        ref={messagebox_ref}
                        placeholder={`Message ${username}`}
                        placeholderTextColor="#767676"
                        onFocus={(e) => {
                            e.stopPropagation();
                        setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
                        }}
                        onChangeText={text => setMessageValue(text)}
                        editable={!isSending}
                    />
                    <TouchableOpacity onPress={handle_message_send} disabled={isSending}>
                        <Image style={styles.send_button} source={require("../assets/messages/send_button.png")} />
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
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