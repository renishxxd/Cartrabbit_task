import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let globalSocket = null;

export const useSocket = (url) => {
  const [socket, setSocket] = useState(globalSocket);
  const [isConnected, setIsConnected] = useState(globalSocket?.connected || false);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to websocket when user is logged in
    if (user && !globalSocket) {
      const defaultUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      globalSocket = io(url || defaultUrl, {
        query: {
          userId: user._id
        }
      });

      globalSocket.on('connect', () => setIsConnected(true));
      globalSocket.on('disconnect', () => setIsConnected(false));
      
      setSocket(globalSocket);
    } else if (user && globalSocket) {
      setSocket(globalSocket);
      setIsConnected(globalSocket.connected);
    }

    // Cleanup logic: typically handled on logout, so we don't disconnect 
    // simply because a single component unmounts.
  }, [user, url]);

  return { socket, isConnected };
};
