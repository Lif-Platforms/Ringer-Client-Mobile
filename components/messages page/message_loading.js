/*
Skeleton loader for messages
*/
import SkeletonLoader from "@components/global/skeleton_loader";
import { View, StyleSheet } from "react-native";

export default function MessageLoading() {
    // Pick random dimensions for message text
    const randomHeight = Math.floor(Math.random() * 10) + 50;
    const randomWidth = Math.floor(Math.random() * 31) + 50;

    // Pick if the message is sent or received
    // to adjust alignment of skeleton loader
    // 0 = received, 1 = sent
    const sentOrReceived = Math.round(Math.random());

    // Set alignment based on sent or received
    const textStyles = sentOrReceived === 1 ? { alignItems: "flex-end" } : { alignItems: "flex-start" };

    return (
        <View style={[styles.message, {
            flexDirection: sentOrReceived === 1 ? "row-reverse" : "row"
        }]}
        >
            <SkeletonLoader
                height={20}
                width={20}
                borderRadius={100}
            />
            <View style={[styles.messageTextContainer, textStyles]}>
                <SkeletonLoader
                    height={randomHeight}
                    width={`${randomWidth}%`}
                    borderRadius={10}
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
        alignItems: "flex-end",
    },
    messageTextContainer: {
        flex: 1,
        flexDirection: "column",
        gap: 5,
    },
});
