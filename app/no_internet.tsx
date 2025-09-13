import { View, Image, Text, TouchableOpacity } from "react-native";
import styles from "../styles/no_internet/style";
import { reloadAppAsync } from "expo";

export default function NoInternet() {

    async function handle_retry() {
        await reloadAppAsync();
    }

    return (
        <View style={styles.page}>
            <Image
                source={require(`@assets/no_internet/no_internet.png`)}
                style={styles.icon}
            />
            <Text style={styles.title}>We Can't Reach Ringer</Text>
            <Text style={styles.subtitle}>We are having trouble accessing the Ringer service. Make sure your device has internet.</Text>
            <TouchableOpacity onPress={handle_retry} style={styles.retry_button}>
                    <Text style={styles.retry_button_text}>Retry</Text>
            </TouchableOpacity>
        </View>
    )
}