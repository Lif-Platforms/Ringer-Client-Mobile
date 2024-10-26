import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import getEnvVars from "../variables";
import * as SecureStore from "expo-secure-store";
import { eventEmitter } from "./emitter";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";

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
      webSocketRef.current = new WebSocket(`${getEnvVars.ringer_url_ws}/live_updates`);

      webSocketRef.current.onopen = async () => {
        setIsConnected(true);
        console.log('WebSocket connected');

        const credentials = await get_auth_credentials();
        webSocketRef.current.send(JSON.stringify({"Username": credentials.username, "Token": credentials.token}));
        console.log("Auth credentials sent");
      };

      webSocketRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        webSocketRef.current = null;

        // Attempt to reconnect if the connection was not closed manually
        if (shouldReconnect.current) {
          setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
        }
      };

      webSocketRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        // Get user credentials
        const credentials = await get_auth_credentials();

        if (data.Type === "MESSAGE_UPDATE") {
          eventEmitter.emit("Message_Update", {
            id: data.Id,
            message: data.Message
          });

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
        }
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

  const sendMessage = (message, conversation_id) => {
    if (webSocketRef.current && isConnected) {
      webSocketRef.current.send(JSON.stringify({ MessageType: "SEND_MESSAGE", ConversationId: conversation_id, Message: message }));
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, connectWebSocket, sendMessage, closeConnection }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
