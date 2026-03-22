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
      const defaultUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      const socketInstance = io(url || defaultUrl, {
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
