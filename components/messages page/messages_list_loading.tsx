/*
Displays the skeleton loader for the messages list
*/
import { useConversationData } from "@scripts/conversation_data_provider";
import MessageLoading from "./message_loading";

export default function MessagesListLoading() {
    // Generate a list of numbers to map the messages from
    const messages = Array.from({ length: 15 }, (_, index) => index + 1);

    // Determine if the loaders should be displayed
    const { showLoader, isLoading } = useConversationData();

    if (showLoader && isLoading) {
        return (
            <>
                {messages.map((message) => (
                    <MessageLoading key={message} />
                ))}
            </>
        );
    }
}