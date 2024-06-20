import { View,  TouchableOpacity, Image, Animated } from "react-native";
import styles from "../styles/components/bottom_nav/style";

function BottomNavBar({ navigation }) {
    return (
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.replace("Main")}>
                <Image source={require("../assets/bottom_nav/people_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace("Notifications")}>
                <Image source={require("../assets/bottom_nav/notification_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image source={require("../assets/bottom_nav/profile_icon.png")} />
            </TouchableOpacity>
        </View>
    )
}

export default BottomNavBar;