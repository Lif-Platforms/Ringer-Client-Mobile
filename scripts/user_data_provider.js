import {
    createContext,
    useState,
    useContext,
    useEffect,
} from "react";
import { useCache } from "./cache_provider";
import * as Notifications from "expo-notifications";

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [dataQueue, setDataQueue] = useState([]);
    const [isCacheData, setIsCacheData] = useState(false);

    const { updateUser } = useCache();

    /**
    * Add an item to data queue
    *
    * @param {string} type - The type of data being added to the queue.
    * @param {object} data - The data being added to the queue.
    */
    function queue_data_update(type, data) {
        // Create copy of current data queue
        let newDataQueue = [...dataQueue];

        // Add data to queue
        newDataQueue.push({type: type, data: data});

        // Update queue
        setDataQueue(newDataQueue);
    }

    /**
    * Updates the online status of users
    *
    * @param {string} username -The user who's status is being updated.
    * @param {boolean} online - The value the users status is being set to.
    */
    function update_user_presence(username, online) {
        // Check if user data has loaded in yet
        // If not, add data to queue
        if (userData) {
            // Update the user data immutably
            const newUserData = userData.map((user) => {
                if (user.Username === username) {
                    return { ...user, Online: online };
                }
                return user;
            });

            // Update the user data
            setUserData(newUserData);
        } else {
            // Add data to queue to be added in once user data loads
            queue_data_update("user_presence", {
                username: username,
                online: online
            });
        }
    }

    /**
    * Updates the last sent message for a specific conversation
    *
    * @param {string} message_author - The author of the message.
    * @param {string} message - The content of the message.
    * @param {number} conversation_id - The ID of the conversation to update.
    */
    function update_last_sent_message(message_author, message, conversation_id) {
        // Check if user data has loaded in yet
        // If not, add data to queue
        if (userData) {
            // Update the user data immutably
            const newUserData = userData.map((user) => {
                if (user.Id === conversation_id) {
                    return { ...user, Last_Message: `${message_author} - ${message}` };
                }
                return user;
            });

            // Update the user data
            setUserData(newUserData);
        } else {
            // Add data to queue to be added in once user data loads
            queue_data_update("last_sent_message", {
                author: message_author,
                message: message,
                conversation_id: conversation_id,
            });
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
    function incrementUnreadMessages(conversationId, increment) {
        if (!Array.isArray(userData)) return;

        const newUserData = userData.map(user => {
            if (user.Id === conversationId) {
                // Ensure Unread_Messages is a number
                const unread = typeof user.Unread_Messages === "number" ? user.Unread_Messages : 0;
                console.log("current unread messages for", conversationId, ":", unread);
                return { ...user, Unread_Messages: unread + increment };
            }
            return user;
        });

        console.log("incrementing unread messages for", conversationId, "by", increment);
        setUserData(newUserData);
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
        })

        console.log("total unread messages:", totalUnreadMessages)

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
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUserData = () => {
    return useContext(UserDataContext);
};