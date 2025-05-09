import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../api/chat.service';

const ChatList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const { data } = await chatService.getChatRooms();
        
        // Process chat rooms to get other participant's details
        const processedRooms = data.map(room => {
          if (!room.isGroup) {
            const otherParticipant = room.participants?.find(
              p => p._id !== user?._id
            ) || {};
        
            return {
              ...room,
              displayName: otherParticipant.username || 'Unknown User',
              image: otherParticipant.image
                ? `http://localhost:5000/uploads/${otherParticipant.image}`
                : null,
              status: otherParticipant.isOnline ? 'online' : 'offline'
            };
          }
          return {
            ...room,
            displayName: room.name || 'Group Chat',
            image: room.image
              ? `http://localhost:5000/uploads/${room.image}`
              : null,
          };
        });
        setChatRooms(processedRooms);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?._id) {
      fetchChatRooms();
    } else {
      setError('Please log in to view messages');
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  const handleRoomClick = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-indigo-200 mb-3" />
          <h3 className="text-lg font-medium text-indigo-900 mb-2">Sign in Required</h3>
          <p className="text-indigo-200 mb-4">Please sign in to view your messages</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-indigo-100 rounded"></div>
              <div className="h-4 bg-indigo-100 rounded"></div>
              <div className="h-4 bg-indigo-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-indigo-100 bg-indigo-900">
        <h2 className="text-xl font-semibold text-yellow-300 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-teal-600" />
          Messages
        </h2>
      </div>
  
      <div className="divide-y divide-indigo-100">
        {chatRooms.map((room) => (
          <div
            key={room._id}
            onClick={() => handleRoomClick(room._id)}
            className="p-4 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                  {room.isGroup ? (
                    <Users className="w-6 h-6 text-teal-600" />
                  ) : room.image ? (
                    <img
                      src={room.image}
                      alt={room.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-indigo-900" />
                  )}
                </div>
                {!room.isGroup && room.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-600 rounded-full border-2 border-white" />
                )}
              </div>
  
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold textvisuals text-indigo-900 truncate">
                    {room.displayName}
                  </p>
                  {room.lastMessage?.createdAt && (
                    <span className="text-xs text-indigo-200">
                      {new Date(room.lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-indigo-200 truncate">
                    {room.lastMessage?.content || 'No messages yet'}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs rounded-full bg-teal-600 text-white">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
  
        {chatRooms.length === 0 && (
          <div className="p-8 text-center text-indigo-200">
            <MessageCircle className="w-12 h-12 mx-auto text-indigo-200 mb-3" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start a conversation to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
