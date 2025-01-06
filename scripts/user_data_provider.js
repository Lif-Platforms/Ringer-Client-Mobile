import { createContext, useState, useContext } from "react";

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    // Handles updating user online status
    function update_user_presence(username, online) {
        // Update the user data immutably
        const newUserData = userData.map((user) => {
            if (user.Username === username) {
                return { ...user, Online: online };
            }
            return user;
        });

        // Update the user data
        setUserData(newUserData);
    }

    /**
    * Updates the last sent message for a specific conversation.
    *
    * @param {string} message_author - The author of the message.
    * @param {string} message - The content of the message.
    * @param {number} conversation_id - The ID of the conversation to update.
    */
    function update_last_sent_message(message_author, message, conversation_id) {
        // Update the user data immutably
        const newUserData = userData.map((user) => {
            if (user.Id === conversation_id) {
                return { ...user, Last_Message: `${message_author} - ${message}` };
            }
            return user;
        });

        // Update the user data
        setUserData(newUserData);
    }

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