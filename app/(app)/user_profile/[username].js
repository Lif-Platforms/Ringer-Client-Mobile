import { useEffect, useState } from "react";
import styles from "@styles/user_profile/style";
import { View, Image, ScrollView, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { Header } from "@components/user info page/header/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConversationData } from "@scripts/conversation_data_provider";
import { secureGet } from "@scripts/secure_storage";
import FastImage from "react-native-fast-image";

export default function UserProfilePage() {
    // Get page props
    const { username } = useLocalSearchParams({ username });

    const router = useRouter();

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

    async function get_auth_credentials() {
        const username_ = await secureGet("username");
        const token_ = await secureGet("token");

        return { username: username_, token: token_ };
    }

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
        fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_pronouns/${username}`)
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
        fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_bio/${username}`)
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
    function handle_scroll(event) {
        const scrollPosition = event.nativeEvent.contentOffset.y;

        if (scrollPosition >= 80) {
            setHeaderMode(1);
        } else {
            setHeaderMode(0);
        }
    }

    // Handle the user report process
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
                        onPress: (text) => submit_report(text, username, messages, setIsReporting),
                    },
                ],
                'plain-text'
            );
        } else {
            Alert.alert("Sorry", "This feature isn't available on Android yet.")
        }
    }

    function handle_unfriend() {
        async function unfriend_user(setIsUnfriending, conversation_id) {
            setIsUnfriending(true);

            // Get auth credentials
            const credentials = await get_auth_credentials();

            console.log(credentials)

            // Make request to server
            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/remove_conversation/${conversation_id}`, {
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
                <View style={styles.header}>
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