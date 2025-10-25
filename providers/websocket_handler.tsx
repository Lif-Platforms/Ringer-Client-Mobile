import React, { createContext, useContext, useRef, useState, useEffect, RefObject } from 'react';
import { eventEmitter } from "@scripts/emitter";
import { useUserData } from '@providers/user_data_provider';
import { useConversationData } from '@scripts/conversation_data_provider';
import { useCache } from '@scripts/cache_provider';
import { useAuth } from './auth';

type WebSocketProviderType = {
  isConnected: boolean;
  connectWebSocket: () => void;
  sendMessage: (
    message: string,
    conversation_id: string,
    GIF_url: string | undefined
  ) => void;
  updateTypingStatus: (
    status: string,
    conversation_id: string
  ) => void;
  viewMessage: (
    conversation_id: string,
    message_id: string
  ) => void;
  closeConnection: () => void;
  shouldReconnect: boolean;
}

const WebSocketContext = createContext<WebSocketProviderType>({
  isConnected: false,
  connectWebSocket: () => {},
  sendMessage: () => {},
  updateTypingStatus: () => {},
  viewMessage: () => {},
  closeConnection: () => {},
  shouldReconnect: false
});

export const WebSocketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState<boolean>(false); // Track if we should attempt to reconnect
  const { update_user_presence, update_last_sent_message } = useUserData();

  // Grab conversation data context
  const { addMessages } = useConversationData();

  const { addToMessagesCache } = useCache();

  const { username, token } = useAuth();

  useEffect(() => {
    // Attempt to connect when the component mounts
    connectWebSocket();

    // Clean up WebSocket connection when the component unmounts
    return () => {
      closeConnection();
    };
  }, []);

  const connectWebSocket = () => {
    if (!webSocketRef.current) {
      webSocketRef.current = new WebSocket(`${process.env.EXPO_PUBLIC_RINGER_SERVER_WS}/live_updates`);

      webSocketRef.current.onopen = async () => {
        setIsConnected(true);
        if (webSocketRef.current) {
          webSocketRef.current.send(JSON.stringify({"Username": username, "Token": token}));
        }
      };

      webSocketRef.current.onclose = () => {
        setIsConnected(false);
        webSocketRef.current = null;

        // Attempt to reconnect if the connection was not closed manually
        if (shouldReconnect) {
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        }
      };

      webSocketRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.Type === "MESSAGE_UPDATE") {
          // Add message to conversation
          addMessages(data.Id, [data.Message], false);

          // Update last sent message
          update_last_sent_message(
            data.Message.Author,
            data.Message.Message,
            data.Id,
          );

          // Add message to cache
          addToMessagesCache(
            data.Id,
            [data.Message]
          );

          eventEmitter.emit("Msg_Received");
        } else if ("ResponseType" in data && data.ResponseType === "MESSAGE_SENT") {
            eventEmitter.emit("Message_Sent");

        } else if ("Status" in data && data.Status == "Ok") {
            setShouldReconnect(true);

        } else if (data.Type === "USER_STATUS_UPDATE") {
          // Update user presence
          update_user_presence(data.User, data.Online);

        } else if (data.Type === "USER_TYPING") {
          eventEmitter.emit('User_Typing', {
            conversation_id: data.Id,
            user: data.User,
            typing: data.Typing
          });
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  };

  const closeConnection = () => {
    if (webSocketRef.current) {
      setShouldReconnect(false); // Prevent reconnection
      webSocketRef.current.close();
      webSocketRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (
    message: string,
    conversation_id: string,
    GIF_url: string | undefined = undefined
  ) => {
    if (webSocketRef.current && isConnected) {
      type MessageDataType = {
        [key: string]: any;
      };

      let message_data: MessageDataType = {
        MessageType: "SEND_MESSAGE",
        ConversationId: conversation_id,
        Message: message
      };

      // Check for GIF URL and add data to message
      if (GIF_url) {
        message_data.Message_Type = "GIF";
        message_data.GIF_URL = GIF_url;
      }

      webSocketRef.current.send(JSON.stringify(message_data));
    }
  };

  const updateTypingStatus = (status: string, conversation_id: string) => {
    if (webSocketRef.current && isConnected) {
      webSocketRef.current.send(JSON.stringify({
        ConversationId: conversation_id,
        Typing: status,
        MessageType: "USER_TYPING"
      }));
    }
  }

  const viewMessage = (conversation_id: string, message_id: string) => {
    if (!webSocketRef.current || !isConnected) { return; }

    webSocketRef.current.send(JSON.stringify({
      Conversation_Id: conversation_id,
      Message_Id: message_id,
      MessageType: "VIEW_MESSAGE"
    }));
    console.log("message view request sent");
  }

  return (
    <WebSocketContext.Provider 
      value={{
        isConnected,
        connectWebSocket,
        sendMessage,
        closeConnection,
        updateTypingStatus,
        shouldReconnect,
        viewMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
