import { View, Image, Text, TouchableOpacity, Alert} from "react-native";
import getEnvVars from '../../variables';
import styles from '../../styles/messages/message';

function MessageChildren({ author, content, bg_color}) {
    return (
        <View style={[styles.message, {backgroundColor: bg_color}]}>
            <Image
                source={{ uri: `${getEnvVars.auth_url}/profile/get_avatar/${author}.png` }}
                style={styles.message_avatar}
            />
            <View style={styles.message_text_container}>
                <Text style={styles.messages_author}>{author}</Text>
                <Text style={styles.messages_content} selectable={true}>{content}</Text>
            </View>
        </View>
    )
}

export default function Message({ 
    author,
    content,
    failed_to_send,
    send_message,
    setIsSending,
    conversation_id,
    message_id,
    messages,
    setMessages
}) {
    function handle_send() {
        // Make a copy of messages to work with
        let messages_copy = [...messages];

        // Remove failed message from list
        let index = 0;

        messages_copy.forEach((message) => {
            if (message.Id === message_id) {
                messages_copy.splice(index, 1);
            } else {
                index += 1;
            }
        });

        setMessages(messages_copy);

       setIsSending(true);
       send_message(content, conversation_id);
    }

    function handle_press() {
        Alert.alert(
            'Try Again',
            'Would you like to retry sending this message?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Retry',
                    style: 'default',
                    onPress: handle_send
                }
            ]
        )
    }

    if (failed_to_send) {
        return (
            <TouchableOpacity onPress={handle_press}>
                <MessageChildren
                    author={author}
                    content={content}
                    bg_color={'#ff00002c'}
                />
            </TouchableOpacity>
        )
    } else {
        return (
            <MessageChildren
                author={author}
                content={content}
                bg_color={null}
            />
        )
    }
}