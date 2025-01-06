import { createContext, useState, useContext, useEffect } from "react";

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [dataQueue, setDataQueue] = useState([]);

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
    }

    // Move data from queue to user data once it loads in
    useEffect(() => {
        // Check if user data has loaded in
        if (userData && dataQueue.length > 0) {
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
    }, [userData, dataQueue]);   

    return (
        <UserDataContext.Provider value={{
            userData,
            setUserData,
            update_user_presence,
            update_last_sent_message,
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUserData = () => {
    return useContext(UserDataContext);
};