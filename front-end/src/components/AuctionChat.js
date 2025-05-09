import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import { SOCKET_EVENTS } from '../config/constants';

const AuctionChat = ({ auctionId, chatRoomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/v1/chats/${chatRoomId}/messages`);
        setMessages(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load chat messages');
        setLoading(false);
      }
    };

    if (chatRoomId) {
      fetchMessages();
    } else {
      setLoading(false);
    }

    // Setup socket connection
    socketRef.current = io(process.env.REACT_APP_API_URL || '');
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_chat_room', chatRoomId);
    });
    
    socketRef.current.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatRoomId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(`/api/v1/chats/${chatRoomId}/messages`, {
        content: newMessage,
        auctionId
      });
      
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) return <div className="text-center py-4">Loading messages...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  if (!chatRoomId) {
    return <div className="bg-gray-50 p-4 rounded text-center">Chat is not available for this auction</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message._id}
              className={`mb-4 ${message.sender._id === user?._id ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                  message.sender._id === user?._id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span>{message.sender.name}</span>
                <span className="ml-2">{moment(message.createdAt).format('h:mm A')}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AuctionChat;