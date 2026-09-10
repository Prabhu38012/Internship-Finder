import { useState, useEffect } from "react";
import socketService from "../services/socketService";

export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);

  useEffect(() => {
    // Only attempt connection if we have a valid token
    if (!token || token === "null" || token === "undefined") {
      return;
    }

    // Add a small delay to avoid connection spam on initial load
    const connectionTimer = setTimeout(() => {
      const socket = socketService.connect(token);

      if (socket) {
        socket.on("connect", () => {
          setIsConnected(true);
          setConnectionInfo(socketService.getConnectionInfo());
        });

        socket.on("disconnect", () => {
          setIsConnected(false);
          setConnectionInfo(socketService.getConnectionInfo());
        });
      }
    }, 1000); // Wait 1 second before connecting

    return () => {
      clearTimeout(connectionTimer);
      // Keep singleton socket connected across route transitions
    };
  }, [token]);

  return {
    isConnected,
    connectionInfo,
    socket: socketService.socket,
  };
};

export default useSocket;
