/*
Skeleton loader for messages
*/
import SkeletonLoader from "@components/global/skeleton_loader";
import { View, StyleSheet } from "react-native";

export default function MessageLoading() {
    return (
        <View style={styles.message}>
            <SkeletonLoader
                height={50}
                width={50}
                borderRadius={100}
            />
            <View style={styles.messageTextContainer}>
                <SkeletonLoader
                    height={20}
                    width={150}
                    borderRadius={100}
                />
                <SkeletonLoader
                    height={20}
                    width="100%"
                    borderRadius={100}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    message: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 30,
        gap: 10,
    },
    messageTextContainer: {
        flex: 1,
        flexDirection: "column",
        gap: 5,
    },
});
