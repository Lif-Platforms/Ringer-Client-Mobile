import { createContext, useState, useContext, useEffect } from 'react';
import React from 'react';
import { secureSave, secureGet, secureDelete } from '../scripts/secure_storage';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';

type AuthContextType = {
    isAuthenticated: boolean;
    username: string | null;
    token: string | null;
    login: (
        username: string,
        password: string,
        two_fa_code: string | null
    ) => void;
    logout: () => void;
    verifyCredentials: () => void;
    appState: string;
    prompt2FACode: boolean;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Create Auth Provider
export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [appState, setAppState] = useState<string>(AppState.currentState);
    const [prompt2FACode, setPrompt2FACode] = useState<boolean>(false);

    // Track and update app state
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const router = useRouter();

    const login = async (
        username: string,
        password: string,
        two_fa_code: string | null
    ) => {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        if (two_fa_code) {
            formData.append("two_fa_code", two_fa_code);
        }

        const response = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/auth/v2/login`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.errorCode === "2FA_REQUIRED") {
            setPrompt2FACode(true);
            return;
        }

        if (data.errorCode === "INVALID_2FA_CODE") {
            throw new Error("Invalid 2FA Code");
        }

        if (response.status === 401) {
            throw new Error("Incorrect Username or Password");
        }

        if (!response.ok) {
            throw new Error("Something Went Wrong!");
        }

        // Save credentials securely
        secureSave("username", username);
        secureSave("token", data.token);

        // Update state to reflect authenticated status
        setIsAuthenticated(true);
        setToken(data.token);
        setUsername(username);

        router.replace('/(tabs)');
    };

    const logout = () => {
        // Clear authentication state
        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
        setPrompt2FACode(false);
        secureDelete("username");
        secureDelete("token");
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
            appState,
            prompt2FACode
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}