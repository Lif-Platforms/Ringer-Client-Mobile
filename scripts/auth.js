import { createContext, useState } from 'react';
import { secureSave, secureGet } from './secure_storage';

// Create Auth Context
export const AuthContext = createContext(null);

// Create Auth Provider
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const response = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/auth/login`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Incorrect Username or Password");
                throw new Error("Something Went Wrong!");
            }

            const data = await response.json();

            // Save credentials securely
            secureSave("username", username);
            secureSave("token", data.token);

            // Update state to reflect authenticated status
            setIsAuthenticated(true);
            setToken(data.token);
            setUsername(username);
        } catch (err) {
            console.error(err);
        }
    };

    const logout = () => {
        // Clear authentication state
        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
    };

    const verifyCredentials = async () => {
        try {
            // Get stored credentials
            const storedUsername = await secureGet("username");
            const storedToken = await secureGet("token");

            if (storedToken && storedUsername) {
                // Create request body
                const formData = new FormData();
                formData.append("username", storedUsername);
                formData.append("token", storedToken);

                // Make request to verify token
                const response = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/auth/verify_token`, {
                    method: "POST",
                    body: formData,
                });

                // Check response status
                if (response.ok) {
                    setIsAuthenticated(true);
                    setToken(storedToken);
                    return;
                } else if (response.status === 401) {
                    throw new Error("Unauthorized");
                } else {
                    throw new Error("Failed to verify credentials");
                }
            } else {
                throw new Error("No stored credentials");
            }
        } catch (err) {
            throw new Error("Failed to verify credentials");
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, username, login, logout, verifyCredentials }}>
            {children}
        </AuthContext.Provider>
    );
};