import { createContext, useState, useContext, useRef } from "react";
import { showNotification } from "./notification_handler";
import { useUserData } from "@providers/user_data_provider";

const ConversationDataContext = createContext();

export const ConversationDataProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false); // This state is not used in the current code, but can be used to control loading indicators
    const [conversationName, setConversationName] = useState(null);
    const conversationId = useRef(null);

    const { incrementUnreadMessages } = useUserData();

    /**
    * Set the current conversation data.
    * @param {string} name - The name of the conversation.
    * @param {string} id - The ID of the conversation.
    */
    function setConversationData(name, id) {
        setConversationName(name);
        conversationId.current = id;
    }

    /**
    * Add messages to the conversation.
    * @param {string} conversation_id - The ID of the conversation.
    * @param {Array} messages - The messages to add.
    * @param {boolean} before - If true, add messages before existing ones; otherwise, add after.
    */
    function addMessages(conversation_id, messages, before = false) {
        // Ensure conversation_id and messages were supplied
        if (!conversationId || !messages) {
            throw new Error("conversation_id and messages parameters are required!");
        }

        // Check messages data type
        if (!Array.isArray(messages)) {
            throw new Error("Messages must be an array!");
        }

        // Check if the conversationId matches the current conversation
        if (conversation_id !== conversationId.current) {
            // Display a notification for each message
            // Increment unread messages for each conversation
            messages.forEach((message) => {
                try {
                    showNotification(
                        message.Author,
                        conversation_id,
                        message.Message
                    );
                    incrementUnreadMessages(conversation_id, 1);
                } catch(err) {
                    console.error(err);
                }
            });
            return;
        }

        // Check if the messages need to be added before or after the existing messages
        if (before) {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
        } else {
            setMessages((prevMessages) => [...prevMessages, ...messages]);
        }
    }

    /**
    * Clear the conversation data.
    */
    function clearConversationData() {
        setMessages([]);
        setConversationName(null);
        conversationId.current = null;
    }

    return (
        <ConversationDataContext.Provider
            value={{
                setConversationData,
                messages,
                isLoading,
                conversationId,
                setMessages,
                addMessages,
                conversationName,
                clearConversationData,
                setIsLoading,
                showLoader,
                setShowLoader,
            }}
        >
            {children}
        </ConversationDataContext.Provider>
    );
}

export const useConversationData = () => {
    return useContext(ConversationDataContext);
}