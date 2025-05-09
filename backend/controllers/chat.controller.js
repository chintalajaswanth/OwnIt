const { ChatRoom, Message } = require('../models/Chat');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Community = require('../models/Community');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { SOCKET_EVENTS } = require('../config/config');
const socketService = require('../services/socketService');

// @desc    Get all chat rooms for user
// @route   GET /api/v1/chat/rooms
// @access  Private

exports.getChatRooms = asyncHandler(async (req, res, next) => {
  const chatRooms = await ChatRoom.find({
    participants: req.user.id,
  })
    .populate('participants', 'username image isOnline')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username image',
      },
    })
    .sort('-updatedAt');

  res.status(200).json({
    success: true,
    count: chatRooms.length,
    data: chatRooms.map(room => ({
      _id: room._id,
      isGroup: room.isGroup,
      groupName: room.groupName || null,
      groupAvatar: room.groupAvatar || null,
      participants: room.participants.map(p => ({
        _id: p._id,
        username: p.username,
        image: p.image || null,
        isOnline: p.isOnline || false,
      })),
      lastMessage: room.lastMessage
        ? {
            content: room.lastMessage.content,
            createdAt: room.lastMessage.createdAt,
            sender: {
              _id: room.lastMessage.sender._id,
              username: room.lastMessage.sender.username,
              image: room.lastMessage.sender.image || null, // Added avatar to the sender object
            },
          }
        : null,
      unreadCount: room.unreadCountMap?.[req.user.id] || 0, // optional: if you have per-user unread count
    })),
  });
});

// @desc    Get or create private chat room
// @route   GET /api/v1/chat/private/:userId
// @access  Private
exports.getPrivateChatRoom = asyncHandler(async (req, res, next) => {
  const otherUser = await User.findById(req.params.userId);

  if (!otherUser) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userId}`, 404)
    );
  }

  let chatRoom = await ChatRoom.findOne({
    isGroup: false,
    participants: { $all: [req.user.id, req.params.userId] }
  });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      participants: [req.user.id, req.params.userId],
      isGroup: false
    });
  }

  chatRoom = await ChatRoom.findById(chatRoom._id)
    .populate('participants', 'username image')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'username image' }
    });

  res.status(200).json({
    success: true,
    data: {
      _id: chatRoom._id,
      participants: chatRoom.participants.map(p => ({ username: p.username, profileImage: p.image })),
      lastMessage: chatRoom.lastMessage
        ? { content: chatRoom.lastMessage.content, sender: chatRoom.lastMessage.sender.username, timestamp: chatRoom.lastMessage.createdAt }
        : null
    }
  });
});
// @desc    Get auction chat room
// @route   GET /api/v1/chat/auction/:auctionId
// @access  Private
// GET /api/v1/chat/auction/:auctionId
exports.getAuctionChatRoom = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const userId = req.user.id; // Use .id instead of ._id for consistency

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new ErrorResponse(`Auction not found`, 404));
  }

  let chatRoom = await ChatRoom.findOne({ auction: auctionId });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      auction: auctionId,
      isGroup: true,
      groupName: `Auction: ${auction.title}`,
      participants: [userId, auction.user],
      groupAdmin: auction.user
    });
  } else if (!chatRoom.participants.includes(userId)) {
    chatRoom.participants.push(userId);
    await chatRoom.save();
  }

  const populatedRoom = await ChatRoom.findById(chatRoom._id)
    .populate('participants', 'username image')
    .populate('lastMessage');

  res.status(200).json({
    success: true,
    data: populatedRoom
  });
});

// @desc    Get community chat room
// @route   GET /api/v1/chat/community/:communityId
// @access  Private
exports.getCommunityChatRoom = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.communityId);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.communityId}`, 404)
    );
  }

  const isMember = community.members.some(
    member => member.toString() === req.user.id
  );

  if (!isMember && community.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this community chat`,
        401
      )
    );
  }

  let chatRoom;

  if (community.chatRoom) {
    chatRoom = await ChatRoom.findById(community.chatRoom)
      .populate('participants', 'username profile.image')
      .populate('messages');
  } else {
    chatRoom = await ChatRoom.create({
      participants: [...community.members, community.creator],
      isGroup: true,
      groupName: community.name,
      groupAdmin: community.creator,
      community: community._id
    });

    community.chatRoom = chatRoom._id;
    await community.save();

    chatRoom = await ChatRoom.findById(chatRoom._id)
      .populate('participants', 'username profile.image')
      .populate('messages');
  }

  res.status(200).json({
    success: true,
    data: chatRoom
  });
});

// @desc    Send message
// @route   POST /api/v1/chat/message
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { chatRoomId, content } = req.body;

  const chatRoom = await ChatRoom.findById(chatRoomId);

  if (!chatRoom) {
    return next(
      new ErrorResponse(`Chat room not found with id of ${chatRoomId}`, 404)
    );
  }

  const isParticipant = chatRoom.participants.some(
    participant => participant.toString() === req.user.id
  );

  if (!isParticipant && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to send messages in this chat`,
        401
      )
    );
  }

  const message = await Message.create({
    sender: req.user.id,
    content,
    chatRoom: chatRoom._id
  });
  
  chatRoom.lastMessage = message._id;
  chatRoom.messages.push(message._id);
  await chatRoom.save();

  const populatedMessage = await Message.findById(message._id).populate('sender', 'username profile.image');

  socketService.emitToRoom(
    `chat_${chatRoom._id}`,
    SOCKET_EVENTS.NEW_MESSAGE,
    populatedMessage
  );

  res.status(201).json({
    success: true,
    data: populatedMessage
  });
});

// @desc    Get chat room messages
// @route   GET /api/v1/chat/messages/:chatRoomId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

  if (!chatRoom) {
    return next(
      new ErrorResponse(`Chat room not found with id of ${req.params.chatRoomId}`, 404)
    );
  }

  const isParticipant = chatRoom.participants.some(
    participant => participant.toString() === req.user.id
  );

  if (!isParticipant && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view messages in this chat`,
        401
      )
    );
  }

  const messages = await Message.find({ chatRoom: chatRoom._id })
    .populate('sender', 'username profile.image')
    .sort('createdAt');

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});
