import { View,  TouchableOpacity, Image } from "react-native";
import styles from "../styles/components/bottom_nav/style";

function BottomNavBar() {
    return (
        <View style={styles.navbar}>
            <TouchableOpacity>
                <Image source={require("../assets/bottom_nav/people_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image source={require("../assets/bottom_nav/notification_icon.png")} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image source={require("../assets/bottom_nav/profile_icon.png")} />
            </TouchableOpacity>
        </View>
    )
}

export default BottomNavBar;