const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const socketService = require('./services/socketService');
const auctionService = require('./services/auctionService');
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;
// Configure allowed origins
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:4000'], // Add all your frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Explicitly enable both
});


// Initialize socket service
socketService.init(io);

// Check for expired auctions every minute
const auctionCheckInterval = setInterval(() => {
  auctionService.checkExpiredAuctions()
    .catch(err => console.error('Error checking expired auctions:', err));
}, 60000);

// Handle server startup
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

});

// Error handling
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, Error: ${err.message}`);
  // Consider logging to a service like Sentry here
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  clearInterval(auctionCheckInterval);
  
  // Close all Socket.IO connections
  io.close();
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});