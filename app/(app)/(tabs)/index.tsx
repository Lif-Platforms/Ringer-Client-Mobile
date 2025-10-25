import { 
    View,
    Text,
    Image,
    Pressable,
} from "react-native";
import { useEffect } from "react";
import styles from "@styles/main/style";
import { useWebSocket } from "@providers/websocket_handler";
import { useRouter } from "expo-router";
import FriendsList from "@components/index/friends_list";
// @ts-ignore: allow importing image asset without a declaration file
import AddIcon from "@assets/main/add_button.png";

export default function MainScreen() {
    const { connectWebSocket } = useWebSocket();

    useEffect(() => {
        connectWebSocket(); // Connect WebSocket when HomeScreen mounts
    }, []);

    const router = useRouter();

    return(
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
            </View>
            <FriendsList />
            <Pressable
                style={({ pressed }) => [styles.add_button, {
                    transform: [{ scale: pressed ? 0.85 : 1 }]
                }]}
                onPress={() => router.push("/add_friend")}
            >
                <Image style={styles.add_button_icon} source={AddIcon} />
            </Pressable>
        </View>
    )
}