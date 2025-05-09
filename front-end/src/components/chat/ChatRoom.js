import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../api/chat.service';
import io from 'socket.io-client';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !user?._id) {
      setError('Invalid chat room or user not logged in');
      setLoading(false);
      navigate('/chat');
      return;
    }

    // Connect to socket
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinChatRoom', roomId);

    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await chatService.getMessages(roomId);
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch messages');
        setLoading(false);
      }
    };

    fetchMessages();

    // Cleanup socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveChatRoom', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate, user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await chatService.sendMessage(roomId, newMessage);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#FFFDD0] rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex mb-4 ${
              message.sender._id === user._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender._id === user._id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-indigo-900'
              }`}
            >
              <p className="text-sm font-medium mb-1 text-yellow-300">
                {message.sender.username}
              </p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t bg-indigo-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-indigo-300 px-4 py-2 focus:outline-none focus:border-teal-600 bg-white text-indigo-900"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;