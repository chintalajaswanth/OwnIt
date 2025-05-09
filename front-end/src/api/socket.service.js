// src/api/socket.service.js
import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// This is a singleton instance for direct imports
let socket = null;

// Regular service for direct imports without hooks
const socketService = {
  // Initialize socket connection with token
  initialize: (token) => {
    if (socket) return socket;
    
    socket = io('http://localhost:5000/', {
      auth: {
        token
      }
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    return socket;
  },
  
  // Join a specific chat room
  joinRoom: (roomId) => {
    if (!socket) return;
    socket.emit('joinRoom', roomId);
  },
  
  // Leave a specific chat room
  leaveRoom: (roomId) => {
    if (!socket) return;
    socket.emit('leaveRoom', roomId);
  },
  
  // Listen for events
  on: (event, callback) => {
    if (!socket) return;
    socket.on(event, callback);
  },
  
  // Remove event listeners
  off: (event) => {
    if (!socket) return;
    socket.off(event);
  },
  
  // Disconnect from WebSocket server
  disconnect: () => {
    if (!socket) return;
    socket.disconnect();
    socket = null;
  }
};

export default socketService;

// Custom hook for components to use socket with authentication
export const useSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Only establish connection if we have a user and token
    if (!user || !token) return;
    
    // Initialize socket with token
    const socketInstance = socketService.initialize(token);
    
    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
    };
    
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    
    // If already connected, set state accordingly
    if (socketInstance.connected) {
      setIsConnected(true);
    }
    
    // Cleanup on unmount
    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, [user, token]);
  
  return {
    isConnected,
    joinRoom: socketService.joinRoom,
    leaveRoom: socketService.leaveRoom,
    on: socketService.on,
    off: socketService.off
  };
};