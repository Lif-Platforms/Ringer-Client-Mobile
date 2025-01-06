import { createContext, useState, useContext, useEffect } from "react";

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

    // Update last sent message
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
            update_last_sent_message
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUserData = () => {
    return useContext(UserDataContext);
};