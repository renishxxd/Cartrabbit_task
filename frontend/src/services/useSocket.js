import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to websocket when user is logged in
    if (user && !socket) {
      const socketInstance = io(url || 'http://localhost:5000', {
        query: {
          userId: user._id
        }
      });

      socketInstance.on('connect', () => setIsConnected(true));
      socketInstance.on('disconnect', () => setIsConnected(false));
      
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user, url]);

  return { socket, isConnected };
};
