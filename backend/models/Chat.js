const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// Message Schema
const messageSchema = new Schema({
  sender: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  chatRoom: {
    type: Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  readBy: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ChatRoom Schema
const chatRoomSchema = new Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
  },
  participants: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      type: Types.ObjectId,
      ref: 'Message',
    },
  ],
  lastMessage: {
    type: Types.ObjectId,
    ref: 'Message',
  },

  // 👇 Additional fields for Auction chat
  type: {
    type: String,
    enum: ['private', 'group', 'auction'],
    default: 'private',
  },


}, { timestamps: true });

// Models
const Message = model('Message', messageSchema);
const ChatRoom = model('ChatRoom', chatRoomSchema);

module.exports = { Message, ChatRoom };
