const express = require('express');
const {
  getChatRooms,  // This is plural "Rooms"
  getPrivateChatRoom,
  
  getCommunityChatRoom,
  sendMessage,
  getMessages
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);  

// Fix: Changed getChatRooms to getChatRooms (plural)
router.route('/rooms')
  .get(getChatRooms);  // Make sure this matches exactly with the imported function

router.route('/private/:userId')
  .get(getPrivateChatRoom);

router.route('/community/:communityId')
  .get(getCommunityChatRoom);

router.route('/message')
  .post(sendMessage);

router.route('/messages/:chatRoomId')
  .get(getMessages);

module.exports = router;