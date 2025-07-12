/*
Skeleton placeholder for the Friend component.
*/
import { View, StyleSheet } from "react-native";
import SkeletonLoader from "@components/global/skeleton_loader";

export default function FriendLoading() {
    return (
        <View style={styles.container}>
            <SkeletonLoader
                width={40}
                height={40}
                borderRadius={100}
            />
            <View style={styles.textContainer}>
                <SkeletonLoader
                    width={120}
                    height={20}
                    borderRadius={100}
                />
                <SkeletonLoader
                    width="100%"
                    height={20}
                    borderRadius={100}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#525252",
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
        gap: 5,
    },
});
