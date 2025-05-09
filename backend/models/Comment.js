const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// Comment Schema
const commentSchema = new Schema(
  {
    auctionId: {
      type: Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Comment = model('Comment', commentSchema);

module.exports = Comment;
