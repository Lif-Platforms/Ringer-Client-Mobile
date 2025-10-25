import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "@styles/add_friend/search_result";
// @ts-ignore: allow importing image asset without a declaration file
import nextArrow from '@assets/add_friend/next_arrow.png';
import { useCallback } from "react";

type SearchResultParams = {
    username: string;
    handleNext: (username: string) => void;
}

export default function SearchResult({ username, handleNext }: SearchResultParams) {
    const nextFunction = useCallback(() => {
        handleNext(username);
    }, [username, handleNext]);

    return (
        <View style={styles.result}>
            <View style={styles.user}>
                <Image
                    source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/profile/get_avatar/${username}.png` }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>{username}</Text>
            </View>
            <TouchableOpacity 
                style={styles.add_button}
                onPress={nextFunction}
            >
                <Image style={styles.add_button_icon} source={nextArrow} />
            </TouchableOpacity>
        </View>
    )
}  