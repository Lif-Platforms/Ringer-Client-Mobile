import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from "react";
import { useCache } from "@scripts/cache_provider";
import * as Notifications from "expo-notifications";
import { UserDataType } from "../types";

type UserPresenceQueue = {
    type: "user_presence";
    data: { username: string; online: boolean };
};

type LastSentMessageQueue = {
    type: "last_sent_message";
    data: { author: string; message: string; conversation_id: number };
};

type QueueDataType = UserPresenceQueue | LastSentMessageQueue;

type UserDataProviderType = {
    userData: UserDataType[] | null;
    setUserData: React.Dispatch<React.SetStateAction<UserDataType[] | null>>;
    update_user_presence: (
        username: string,
        online: boolean
    ) => void;
    update_last_sent_message: (
        message_author: string,
        message: string,
        conversation_id: number
    ) => void;
    setIsCacheData: React.Dispatch<React.SetStateAction<boolean>>;
    incrementUnreadMessages: (
        conversationId: string,
        increment: number
    ) => void;
    setUnreadMessages: (
        conversationId: string,
        count: number
    ) => void;
}

const UserDataContext = createContext<UserDataProviderType | null>(null);

export const UserDataProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [userData, setUserData] = useState<Array<UserDataType> | null>(null);
    const [dataQueue, setDataQueue] = useState<Array<QueueDataType>>([]);
    const [isCacheData, setIsCacheData] = useState(false);

    const { updateUser } = useCache();

    /**
    * Add an item to data queue
    *
    * @param {string} type - The type of data being added to the queue.
    * @param {object} data - The data being added to the queue.
    */
    function queue_data_update(item: QueueDataType) {
        // Append item to data queue
        setDataQueue(prev => [...prev, item]);
    }

    /**
    * Updates the online status of users
    *
    * @param {string} username -The user who's status is being updated.
    * @param {boolean} online - The value the users status is being set to.
    */
    function update_user_presence(username: string, online: boolean) {
        // Check if user data has loaded in yet
        // If not, add data to queue
        if (userData) {
            setUserData(prevUserData => {
                return prevUserData ? prevUserData.map(user => {
                    if (user.Username === username) {
                        return { ...user, Online: online };
                    }
                    return user;
                }) : prevUserData;
            });
        } else {
            // Add data to queue to be added in once user data loads
            queue_data_update({ type: "user_presence", data: { username, online } });
        }
    }

    /**
    * Updates the last sent message for a specific conversation
    *
    * @param {string} message_author - The author of the message.
    * @param {string} message - The content of the message.
    * @param {number} conversation_id - The ID of the conversation to update.
    */
    function update_last_sent_message(
        message_author: string,
        message: string,
        conversation_id: number
    ) {
        // Check if user data has loaded in yet
        // If not, add data to queue
        if (userData) {
            setUserData(prevUserData => {
                return prevUserData ? prevUserData.map(user => {
                    if (String(user.Id) === String(conversation_id)) {
                        return { ...user, Last_Message: `${message_author} - ${message}` };
                    }
                    return user;
                }) : prevUserData;
            });
        } else {
            // Add data to queue to be added in once user data loads
            queue_data_update({ type: "last_sent_message", data: { author: message_author, message, conversation_id } });
        }

        // Update last sent message in cache
        updateUser(
            message_author,
            "Last_Message",
            `${message_author} - ${message}`
        );
    }

    /**
     * Increment number of unread messages for a conversation.
     * @param {string} conversationId - Id of the conversation.
     * @param {number} increment - Amount to increment the unread messages by.
     */
    function incrementUnreadMessages(conversationId: string, increment: number) {
        if (!Array.isArray(userData)) return;

        setUserData(prevUserData => {
            return prevUserData ? prevUserData.map(user => {
                if (String(user.Id) === String(conversationId)) {
                    const unread = typeof user.Unread_Messages === "number" ? user.Unread_Messages : 0;
                    return { ...user, Unread_Messages: unread + increment };
                }
                return user;
            }) : prevUserData;
        });
    }

    /**
     * Set the number of unread messages for a conversation.
     * @param {string} conversationId - Id of the conversation.
     * @param {number} count - Number to set unread messages to.
     */
    function setUnreadMessages(conversationId: string, count: number) {
        if (!Array.isArray(userData)) return;
        
        setUserData(prevUserData => {
            return prevUserData ? prevUserData.map(user => {
                if (String(user.Id) === String(conversationId)) {
                    return { ...user, Unread_Messages: count };
                }
                return user;
            }) : prevUserData;
        });
    }

    // Move data from queue to user data once it loads in
    useEffect(() => {
        // Check if user data has loaded in
        if (userData && dataQueue.length > 0 && !isCacheData) {
            dataQueue.forEach((item) => {
                if (item.type === "user_presence") {
                    update_user_presence(item.data.username, item.data.online);

                } else if (item.type === "last_sent_message") {
                    update_last_sent_message(
                        item.data.author,
                        item.data.message,
                        item.data.conversation_id,
                    );
                }
            });

            // Clear data queue
            setDataQueue([]);
        }
    }, [userData, dataQueue, isCacheData]);

    // Update total unread messages once user data is loaded from server
    useEffect(() => {
        if (!Array.isArray(userData) || isCacheData) { return; };

        let totalUnreadMessages = 0;

        userData.forEach((user) => {
            if (user.Unread_Messages) {
                totalUnreadMessages += user.Unread_Messages;
            }
        });

        Notifications.setBadgeCountAsync(totalUnreadMessages);
    }, [userData, isCacheData]);

    return (
        <UserDataContext.Provider value={{
            userData,
            setUserData,
            update_user_presence,
            update_last_sent_message,
            setIsCacheData,
            incrementUnreadMessages,
            setUnreadMessages,
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUserData = () => {
    const ctx = useContext(UserDataContext);
    if (!ctx) throw new Error("useUserData must be used within a UserDataProvider");
    return ctx;
};