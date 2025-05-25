import { createContext, useState, useContext } from "react";

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
    * @param {Array} messages - The messages to add.
    * @param {boolean} before - If true, add messages before existing ones; otherwise, add after.
    */
    function addMessages(messages, before = false) {
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