import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import * as SecureStore from "expo-secure-store";
import { eventEmitter } from "./emitter";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useUserData } from './user_data_provider';
import { useConversationData } from './conversation_data_provider';
import { useCache } from './cache_provider';

const WebSocketContext = createContext(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Get values from secure store
async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }    
}   

async function get_auth_credentials() {
    const username_ = await getValueFor("username");
    const token_ = await getValueFor("token");

    return { username: username_, token: token_ };
}

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef(null);
  const shouldReconnect = useRef(false); // Track if we should attempt to reconnect
  const [appState, setAppState] = useState(AppState.currentState);
  const { update_user_presence, update_last_sent_message } = useUserData();

  // Grab conversation data context
  const { addMessages } = useConversationData();

  const { addToMessagesCache } = useCache();

  useEffect(() => {
    // Attempt to connect when the component mounts
    connectWebSocket();

    // Clean up WebSocket connection when the component unmounts
    return () => {
      closeConnection();
    };
  }, []);

  useEffect(() => {
    const appStateChangeEvent = AppState.addEventListener("change", () => {
      setAppState(AppState.currentState);
    });

    return () => {
      appStateChangeEvent.remove();
    }
  }, []);

  const connectWebSocket = () => {
    if (!webSocketRef.current) {
      webSocketRef.current = new WebSocket(`${process.env.EXPO_PUBLIC_RINGER_SERVER_WS}/live_updates`);

      webSocketRef.current.onopen = async () => {
        setIsConnected(true);

        const credentials = await get_auth_credentials();
        webSocketRef.current.send(JSON.stringify({"Username": credentials.username, "Token": credentials.token}));
      };

      webSocketRef.current.onclose = () => {
        setIsConnected(false);
        webSocketRef.current = null;

        // Attempt to reconnect if the connection was not closed manually
        if (shouldReconnect.current) {
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        }
      };

      webSocketRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        // Get user credentials
        const credentials = await get_auth_credentials();

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

          // Send client notification if user has app suspended
          if (appState !== "active" && data.Message.Author !== credentials.username) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: data.Message.Author,
                body: data.Message.Message,
              },
              trigger: null,
            });
          }
        } else if ("ResponseType" in data & data.ResponseType === "MESSAGE_SENT") {
            eventEmitter.emit("Message_Sent");

        } else if ("Status" in data && data.Status == "Ok") {
          shouldReconnect.current = true;

        } else if (data.Type === "USER_STATUS_UPDATE") {
          // Update user presence
          update_user_presence(data.User, data.Online);

        } else if (data.Type === "USER_TYPING") {
          eventEmitter.emit('User_Typing', {
            conversation_id: data.Id,
            user: data.User,
            typing: data.Typing
          });
        };
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  };

  const closeConnection = () => {
    if (webSocketRef.current) {
      shouldReconnect.current = false; // Prevent reconnection
      webSocketRef.current.close();
      webSocketRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (message, conversation_id, GIF_url = null) => {
    if (webSocketRef.current && isConnected) {
      let message_data = {
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

  const updateTypingStatus = (status, conversation_id) => {
    if (webSocketRef.current && isConnected) {
      webSocketRef.current.send(JSON.stringify({
        ConversationId: conversation_id,
        Typing: status,
        MessageType: "USER_TYPING"
      }));
    }
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
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
