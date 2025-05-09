import React, { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatContainer from '../chat/ChatContainer';

const Inbox = () => {
  const { loadChatRooms, loading } = useChat();
  
  // Track the loading state for chat rooms to prevent multiple requests
  const [isLoading, setIsLoading] = useState(true);
  const user = localStorage.getItem('userId');  // Example of getting userId from localStorage
  const token = localStorage.getItem('authToken');  // Example of getting token from localStorage

  useEffect(() => {
    if (user && token && !isLoading) {
      console.log('Loading chat rooms...');
      setIsLoading(true); // Set loading to true when starting to load chat rooms
      loadChatRooms()
        .then(() => setIsLoading(false)) // Set loading to false after successful loading
        .catch(() => setIsLoading(false)); // Set loading to false on error
    }
  }, [user, token, isLoading, loadChatRooms]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ChatContainer />
    </div>
  );
};

export default Inbox;
