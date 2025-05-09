const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');  // Assuming the correct path to the controller
const { protect } = require('../middleware/auth');
// Define route for getting comments of a specific auction
router.get('/auctions/:auctionId/comments', commentController.getComments);

// Define route for posting a new comment o n a specific auction
router.post('/auctions/:auctionId/comments',protect, commentController.postComment);

module.exports = router;