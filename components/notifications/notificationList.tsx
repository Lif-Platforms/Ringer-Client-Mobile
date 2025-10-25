import { StyleSheet, Text } from "react-native";
import { NotificationType } from "../../types";
import Notification from "./notification";

type NotificationListPropsType = {
    notifications: NotificationType[];
    isLoading: boolean;
    encounteredError: boolean;
    remove_notification: (id: string) => void;
}

export default function NotificationList({
    notifications,
    isLoading,
    encounteredError,
    remove_notification
}: NotificationListPropsType) {
    if (isLoading) {
        return <Text style={styles.info_text}>Loading...</Text>;
    }

    if (encounteredError) {
        return <Text style={styles.info_text}>Error Loading Friend Requests</Text>;
    }

    if (notifications && notifications.length > 0) {
        return notifications.map((request, key) => (
            <Notification 
                key={key}
                id={request.Request_Id}
                name={request.Sender}
                message={request.Message}
                remove_notification={remove_notification}
            />
        ))
    } else {
        return <Text style={styles.info_text}>No Friend Requests At This Time</Text>;
    }
}

const styles = StyleSheet.create({
    info_text: {
        color: "white",
        textAlign: "center"
    }
})