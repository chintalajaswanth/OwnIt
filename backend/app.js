const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Route files
const auth = require('./routes/auth.routes');
const users = require('./routes/user.routes');
const auctions = require('./routes/auction.routes');
const bids = require('./routes/bid.routes');
const chat = require('./routes/chat.routes');
const communities = require('./routes/community.routes');
const notifications = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const commentRoutes=require('./routes/comment.routes');
const paymentRouter = require('./routes/payment.routes');
const walletRouter=require('./routes/wallet.routes')
// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/auctions', auctions);
app.use('/api/v1/bids', bids);
app.use('/api/v1/chat', chat);
app.use('/api/v1/communities', communities);
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', commentRoutes);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/payment', paymentRouter); 
app.use("/api/v1/admin",adminRoutes)
const productRoutes = require('./routes/product.routes');
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/wallet', walletRouter);
// Error handler middleware
app.use(errorHandler);

module.exports = app;