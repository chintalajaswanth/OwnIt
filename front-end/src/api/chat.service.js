import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/chat';

// Add authorization header to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const chatService = {
  // Get all user's chat rooms
  getChatRooms: async () => {
    const response = await axios.get(`${API_URL}/rooms`);
    return response.data;
  },

  // Get or create private chat room with another user
  getPrivateChatRoom: async (userId) => {
    const response = await axios.get(`${API_URL}/private/${userId}`);
    return response.data;
  },

  // Get community chat room
  getCommunityChatRoom: async (communityId) => {
    const response = await axios.get(`${API_URL}/community/${communityId}`);
    return response.data;
  },

  // Send a message to a chat room
  sendMessage: async (chatRoomId, content) => {
    const response = await axios.post(`${API_URL}/message`, {
      chatRoomId,
      content
    });
    return response.data;
  },

  // Get all messages for a chat room
  getMessages: async (chatRoomId) => {
    const response = await axios.get(`${API_URL}/messages/${chatRoomId}`);
    return response.data;
  }
};

export default chatService;