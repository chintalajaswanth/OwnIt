const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  maxAutoBid: {
    type: Number
  },

},{timestamp:true});

module.exports = mongoose.model('Bid', BidSchema);