import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      // Se connecter au serveur Socket.io
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token,
          userId: user.userId
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connecté au serveur Socket.io:', newSocket.id);
        // Authentifier avec le token
        newSocket.emit('authenticate', {
          token: token,
          userId: user.userId
        });
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Déconnecté du serveur Socket.io');
      });

      newSocket.on('error', (error) => {
        console.error('❌ Erreur Socket.io:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Déconnecter si pas de token
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token, user]);

  const value = {
    socket,
    isConnected: socket?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

