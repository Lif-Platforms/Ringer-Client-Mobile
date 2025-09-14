import { createContext, useState, useContext, useEffect } from 'react';
import React from 'react';
import { secureSave, secureGet } from '../scripts/secure_storage';
import { AppState } from 'react-native';

// Create Auth Context
const AuthContext = createContext({
    isAuthenticated: false,
    token: null as string | null,
    username: null as string | null,
    login: async (username: string, password: string) => {},
    logout: () => {},
    verifyCredentials: async () => {},
    appState: AppState.currentState as string
});

// Create Auth Provider
export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [appState, setAppState] = useState<string>(AppState.currentState);

    // Track and update app state
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const login = async (username: string, password: string) => {
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
                    setUsername(storedUsername);
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
            throw new Error(
                (err instanceof Error && err.message) ||
                (typeof err === "string" && err) ||
                "An error occurred while verifying credentials"
            );
        }
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            token,
            username,
            login,
            logout,
            verifyCredentials,
            appState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { return useContext(AuthContext); }