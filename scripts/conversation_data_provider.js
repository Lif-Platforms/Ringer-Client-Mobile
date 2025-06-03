import { createContext, useState, useContext } from "react";
import { showNotification } from "./notification_handler";

const ConversationDataContext = createContext();

export const ConversationDataProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationName, setConversationName] = useState(null);
    const [conversationId, setConversationId] = useState(null);

    /*
    * Set the current conversation data.
    * @param {string} name - The name of the conversation.
    * @param {string} id - The ID of the conversation.
    */
    function setConversationData(name, id) {
        setConversationName(name);
        setConversationId(id);
    }

    /*
    * Add messages to the conversation.
    * @param {string} conversationId - The ID of the conversation.
    * @param {Array} messages - The messages to add.
    * @param {boolean} before - If true, add messages before existing ones; otherwise, add after.
    */
    function addMessages(conversation_id, messages, before = false) {
        // Check if the conversationId matches the current conversation
        if (conversation_id !== conversationId) {
            // Display a notification for each message
            messages.forEach((message) => {
                showNotification(
                    message.Author,
                    conversation_id,
                    message.Message
                );
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

    /*
    * Clear the conversation data.
    */
    function clearConversationData() {
        setMessages([]);
        setConversationName("");
        setConversationId("");
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
            }}
        >
            {children}
        </ConversationDataContext.Provider>
    );
}

export const useConversationData = () => {
    return useContext(ConversationDataContext);
}