import { useEffect, useState } from "react";
import {
    View,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    Alert,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet
} from "react-native";
import { Header } from "@components/user info page/header/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConversationData } from "@scripts/conversation_data_provider";
import FastImage from "react-native-fast-image";
import { useAuth } from "@providers/auth";

export default function UserProfilePage() {
    // Get page props
    const { username } = useLocalSearchParams();
    const profileUsername: string = Array.isArray(username) ? username[0] : (username ?? "");

    const router = useRouter();

    // Get auth credentials
    const { username: currentUser, token: userToken } = useAuth();

    // Get messages from the current conversation
    const { messages, conversationId } = useConversationData();

    // Store pronouns and bio
    const [userPronouns, setUserPronouns] = useState("...");
    const [userBio, setUserBio] = useState("...");

    // Store header mode state
    // Changes how header looks
    const [headerMode, setHeaderMode] = useState(0);

    // Store reporting state and report button text
    const [isReporting, setIsReporting] = useState(false);
    const [reportButtonText, setReportButtonText] = useState("Report User");

    // Store unfriending state and unfriend button text
    const [isUnfriending, setIsUnfriending] = useState(false);
    const [unfriendButtonText, setUnfriendButtonText] = useState("Unfriend User");

    // Update report button text based on if reporting is in progress
    useEffect(() => {
        if (isReporting) {
            setReportButtonText("Reporting...");
        } else {
            setReportButtonText("Report User");
        }
    }, [isReporting]);

    // Update unfriend button text based on if unfriending is in progress
    useEffect(() => {
        if (isUnfriending) {
            setUnfriendButtonText("Unfriending...");
        } else {
            setUnfriendButtonText("Unfriend User");
        }
    }, [isUnfriending]);

    // Fetch user profile information
    useEffect(() => {
    // Fetch Pronouns
    fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_pronouns/${profileUsername}`)
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("Request failed with status code: " + response.status);
            }
        })
        .then((data) => {
            // Remove the quotes from the data 
            const pronouns = data.replace(/^"|"$/g, '');
            setUserPronouns(pronouns);
        })
        .catch((error) => {
            console.error(error);
            setUserPronouns("Failed to fetch pronouns!");
        })

        // Fetch bio
    fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_bio/${profileUsername}`)
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("Request failed with status code: " + response.status);
            }
        })
        .then((data) => {
            // Remove the quotes from the data and replace \n and \r with actual newline characters 
            const bio = data.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
            setUserBio(bio);
        })
        .catch((error) => {
            console.error(error);
            setUserBio("Failed to fetch bio!");
        })
    }, []);
    // Adjust header mode based on scroll position
    function handle_scroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const scrollPosition = event.nativeEvent.contentOffset.y;

        if (scrollPosition >= 80) {
            setHeaderMode(1);
        } else {
            setHeaderMode(0);
        }
    }

    // Handle the user report process
    function handle_user_report() {
        function submit_report(
            reason: string | undefined,
            username: string,
            content: any[],
            setIsReporting: React.Dispatch<React.SetStateAction<boolean>>
        ) {
            if (!reason || reason.trim() === "") return;

            // Start reporting process
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
            fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/account/report`, {
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
                        onPress: (text: any) => submit_report(text, profileUsername, messages, setIsReporting),
                    },
                ],
                'plain-text'
            );
        } else {
            Alert.alert("Sorry", "This feature isn't available on Android yet.")
        }
    }

    function handle_unfriend() {
        async function unfriend_user(
            setIsUnfriending: React.Dispatch<React.SetStateAction<boolean>>,
            conversation_id: string | undefined
        ) {
            setIsUnfriending(true);

            // Check if auth credentials are available
            if (!currentUser || !userToken) {
                Alert.alert("Failed", "Something went wrong while attempting this action.")
                setIsUnfriending(false);
                return;
            }

            // Make request to server
            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/remove_conversation/${conversation_id}`, {
                method: "DELETE",
                headers: {
                    username: currentUser,
                    token: userToken
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
                                onPress: () => router.replace("/(tabs)"),
                            }
                        ]
                    );
                    router.replace("(tabs)");
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
                    onPress: () => unfriend_user(setIsUnfriending, conversationId)
                }
            ],
            {cancelable: true}
        )
    }

    return (
        <View>
            <Header
                username={username}
                headerMode={headerMode}
            />
            <ScrollView onScroll={handle_scroll} style={styles.page}>
                <View>
                    <FastImage
                        resizeMode={FastImage.resizeMode.cover}
                        source={{
                            uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_banner/${username}.png`,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.web,
                        }}
                        style={styles.user_banner}
                    />
                    <Image
                        source={require('@assets/user_profile/gradient.png')}
                        style={styles.banner_gradient}
                    />
                    <View style={styles.avatar_container}>
                        <FastImage
                            source={{
                                uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png`,
                                priority: FastImage.priority.normal,
                                cache: FastImage.cacheControl.web,
                            }}
                            style={styles.user_avatar}
                        />
                    </View>
                    <Text style={styles.username}>{username}</Text>
                </View>
                <View style={styles.user_info}>
                    <Text style={styles.title}>Pronouns</Text>
                    <Text style={styles.info}>{userPronouns}</Text>
                    <Text style={styles.title}>Bio</Text>
                    <Text style={styles.info}>{userBio}</Text>
                </View>
                <View style={styles.buttons}>
                    <TouchableOpacity disabled={isReporting} style={styles.button} onPress={handle_user_report}>
                        <Text style={styles.button_text}>{reportButtonText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_unfriend} style={styles.button}>
                        <Text style={styles.button_text}>{unfriendButtonText}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#160900",
        height: "100%"
    },
    user_banner: {
        height: 300
    },
    banner_gradient: {
        position: "absolute",
        top: 0,
        height: 300,
        width: "100%"
    },
    avatar_container: {
        width: "100%",
        position: "absolute",
        top: 200,
        flex: 1,
        alignItems: "center"
    },
    user_avatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    user_info: {
        marginTop: 180,
        padding: 15
    },
    title: {
        color: "white",
        fontSize: 30
    },
    info: {
        color: "white",
        backgroundColor: "#181818",
        padding: 10,
        fontSize: 20,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 15
    },
    username: {
        color: "white",
        position: "absolute",
        top: 410,
        textAlign: "center",
        width: "100%",
        fontSize: 30,
        fontWeight: "bold"
    },
    back_button: {
        position: "absolute",
        top: 20,
        left: 10,
        zIndex: 999
    },
    buttons: {
        padding: 15,
        marginBottom: 35
    },
    button: {
        backgroundColor: "#FF9900",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15
    },
    button_text: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    }
});