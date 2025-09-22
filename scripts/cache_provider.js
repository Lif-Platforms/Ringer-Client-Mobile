import { createContext, useContext } from "react";
import { MMKV } from 'react-native-mmkv'
import { useAuth } from "../providers/auth";

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
    const storage = new MMKV();

    // Get current logged in user from auth provider
    const { username } = useAuth();

    /**
     * Sets the user cache with an array of users.
     * @param {Array} users - An array of user objects to be cached.
     */
    function setUserCache(users) {
        // Ensure users is an array
        if (!Array.isArray(users)) {
            throw new Error("setUserCache expects an array of users");
        }

        // Store each user in the cache
        storage.set(`${username}.users`, JSON.stringify(users));
    }

    /**
     * Get the user cache.
     * @returns An array of user objects from the cache or null if cache is empty.
     */
    function getUserCache() {
        const users = storage.getString(`${username}.users`);
        return users ? JSON.parse(users) : null;
    }

    /**
     * Updates a specific user in the cache.
     * @param {string} user - The user object to update.
     * @param {string} key - The key of the user property to update.
     * @param {any} value - The new value for the user property.
     */
    function updateUser(user, key, value) {
        // Get user cache
        let users = getUserCache();

        // Find update user in cache
        users.forEach(cacheUser => {
            if (cacheUser.Username === user) {
                // Update the user property
                cacheUser[key] = value;
            }
        });

        // Set the updated user cache
        setUserCache(users);
    }

    /**
     * Adds messages to a conversation in the cache.
     * If the conversationId already exists, it updates the messages.
     * If it does not exist, it creates a new conversation object.
     * @param {string} conversationId - The ID of the conversation.
     * @param {string} conversationName - The name of the conversation.
     * @param {Array} messages - An array of message objects to be added.
     */
    function addMessagesCache(conversationId, conversationName, messages) {
        // Get existing messages from cache
        const existingMessagesRAW = storage.getString(`${username}.messages`);
        let existingMessages = existingMessagesRAW ? JSON.parse(existingMessagesRAW) : [];

        // Check if conversationId exists in existing messages
        const conversation = existingMessages.find(msg => msg.conversationId === conversationId);
        if (conversation) {
            // Remove conversation from existing messages
            existingMessages = existingMessages.filter(msg => msg.conversationId !== conversationId);

            // Update conversation with new messages
            conversation.messages = messages;

            // Add conversation at front of existing messages
            existingMessages = [conversation, ...existingMessages];
        } else {
            // If conversationId does not exist, create a new conversation object
            const newConversation = {
                conversationId: conversationId,
                conversationName: conversationName,
                messages: messages
            };
            existingMessages = [newConversation, ...existingMessages];
        }

        // Remove all conversations except the first 5
        if (existingMessages.length > 5) {
            existingMessages = existingMessages.slice(0, 5);
        }

        // Store the updated messages in cache
        storage.set(`${username}.messages`, JSON.stringify(existingMessages));
    }

    /**
     * Get conversation cache data.
     * @param {string} conversationId 
     * @returns Conversation data from cache or null if not found.
     */
    function getMessagesCache(conversationId) {
        // Get existing messages from cache
        const existingMessagesRAW = storage.getString(`${username}.messages`);
        const existingMessages = existingMessagesRAW ? JSON.parse(existingMessagesRAW) : [];

        // Find the conversation by ID
        const conversation = existingMessages.find(msg => msg.conversationId === conversationId);

        return conversation || null;
    }

    /**
     * Adds messages to the cache for a specific conversation.
     * @param {string} conversationId - The ID of the conversation.
     * @param {Array} messages - An array of message objects to be added.
     */
    function addToMessagesCache(conversationId, messages) {
        // Get existing messages from cache
        const existingMessagesRAW = storage.getString(`${username}.messages`);
        let existingMessages = existingMessagesRAW ? JSON.parse(existingMessagesRAW) : [];

        // Find the conversation by ID
        const conversation = existingMessages.find(msg => msg.conversationId === conversationId);

        if (conversation) {
            // If conversation exists, add new messages to it
            conversation.messages.push(...messages);
        }

        // Store the updated messages in cache
        storage.set("messages", JSON.stringify(existingMessages));
    }

    /**
     * Clears the entire cache.
     */
    function clearCache() {
        // Clear the MMKV storage
        storage.clearAll();
    }

    return (
        <CacheContext.Provider value={{
            setUserCache,
            getUserCache,
            updateUser,
            clearCache,
            addMessagesCache,
            getMessagesCache,
            addToMessagesCache,
        }}>
            {children}
        </CacheContext.Provider>
    );
}

export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error("useCache must be used within a CacheProvider");
    }
    return context;
}