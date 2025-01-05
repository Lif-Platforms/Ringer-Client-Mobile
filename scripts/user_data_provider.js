import { createContext, useState, useContext } from "react";

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    // Handles updating user online status
    function update_user_presence(username, online) {
        // Make a copy of the current user data
        const newUserData = [...userData];

        // Find the user in the user data
        newUserData.forEach((user) => {
            if (user.Username === username) {
                // Update the user's online status
                user.Online = online;
            }
        });

        // Update the user data
        setUserData(newUserData);
    }

    return (
        <UserDataContext.Provider value={{
            userData,
            setUserData,
            update_user_presence
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUserData = () => {
    return useContext(UserDataContext);
};