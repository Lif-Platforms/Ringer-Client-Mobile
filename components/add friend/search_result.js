import { View, Text, Image } from "react-native";
import styles from "../../styles/add_friend/search_result";
import getEnvVars from "../../variables";

export default function SearchResult({ username }) {
    return (
        <View>
            <View style={styles.user}>
                <Image source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${username}.png` }} style={styles.avatar} />
                <Text style={styles.username}>{username}</Text>
            </View>
        </View>
    )
}  