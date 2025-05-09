const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'auction_start',
      'auction_end',
      'new_bid',
      'outbid',
      'winner',
      'new_message',
      'new_follower',
      'community_invite',
      'product_approved',
      'product_rejected'
    ],
    required: true
  },
  relatedAuction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  relatedCommunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);