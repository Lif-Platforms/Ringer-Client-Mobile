import { View, Image } from "react-native";
import styles from "../../styles/components/bottom_nav/style";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import FastImage from "react-native-fast-image";
import { useAuth } from "@providers/auth";

function BottomNavBar() {
    const [avatarURL, setAvatarURL] = useState<string | null>(null);

    const { username, token } = useAuth();

    useEffect(() => {
        async function fetchAvatarURL() {
            if (!username || !token) return;
            setAvatarURL(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png`);
        }
        fetchAvatarURL();
    }, []);

    return (
        <View style={styles.navbar}>
            <Link href="/(tabs)">
                <Image source={require("@assets/bottom_nav/messages_icon.png")} />
            </Link>
            <Link href="/(tabs)/notifications">
                <Image source={require("@assets/bottom_nav/notifications_icon.png")} />
            </Link>
            <Link href="/(tabs)/account">
                <FastImage 
                    style={styles.avatar}
                    source={{
                        uri: avatarURL ? avatarURL : undefined,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.web,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </Link>
        </View>
    )
}

export default BottomNavBar;