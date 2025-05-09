import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';

const UserChat = ({ userId, username }) => {
  const { getPrivateChat } = useChat();
  const navigate = useNavigate();

  const startChat = async () => {
    try {
      await getPrivateChat(userId);
      navigate('/inbox');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <button
      onClick={startChat}
      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-1.008A6.975 6.975 0 012 16c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
      Message {username}
    </button>
  );
};

export default UserChat;