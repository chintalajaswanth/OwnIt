// services/socketService.js
let io;

module.exports = {
  init: (socketio) => {
    io = socketio;
    
    // Listen for socket connections
    io.on('connection', (socket) => {
      console.log('New client connected', socket.id);
      
      socket.on('joinAuctionRoom', (auctionId) => {
        socket.join(`auction_${auctionId}`);
        console.log(`User ${socket.id} joined auction room: auction_${auctionId}`);
      });
      
      socket.on('leaveAuctionRoom', (auctionId) => {
        socket.leave(`auction_${auctionId}`);
        console.log(`User ${socket.id} left auction room: auction_${auctionId}`);
      });
      
      socket.on('joinChatRoom', (chatRoomId) => {
        socket.join(`chat_${chatRoomId}`);
        console.log(`User ${socket.id} joined chat room: chat_${chatRoomId}`);
      });
      
      socket.on('leaveChatRoom', (chatRoomId) => {
        socket.leave(`chat_${chatRoomId}`);
        console.log(`User ${socket.id} left chat room: chat_${chatRoomId}`);
      });
      
      socket.on('error', (error) => {
        console.error(`Socket ${socket.id} error:`, error);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
      });
    });
    
    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  
  emitToRoom: (room, event, data) => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    io.to(room).emit(event, data);
  }
};