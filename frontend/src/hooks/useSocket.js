import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(socketService.getConnectionStatus());
  const [connectionInfo, setConnectionInfo] = useState(socketService.getConnectionInfo());

  useEffect(() => {
    if (token) {
      const socket = socketService.connect(token);
      
      if (socket) {
        socket.on('connect', () => {
          setIsConnected(true);
          setConnectionInfo(socketService.getConnectionInfo());
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          setConnectionInfo(socketService.getConnectionInfo());
        });
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  return {
    isConnected,
    connectionInfo,
    socket: socketService.socket
  };
};

export default useSocket
