const Comment = require('../models/Comment');  // Assuming the path to the Comment model
const Auction = require('../models/Auction');  // Assuming the path to the Auction model

const getComments = async (req, res) => {
    try {
      const comments = await Comment.find({ auctionId: req.params.auctionId })
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .lean();  // Convert to plain JS object to modify fields
  
      const formattedComments = comments.map(comment => ({
        ...comment,
        user: comment.userId,
        userId: undefined
      }));
  
      res.json({ data: formattedComments });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching comments', error });
    }
  };
  

// Post a new comment on an auction
const postComment = async (req, res) => {
    const { content } = req.body;
    const { auctionId } = req.params;
    const userId = req.user.id;
  
    try {
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return res.status(404).json({ message: 'Auction not found' });
      }
  
      const comment = new Comment({ auctionId, userId, content });
      const newComment = await comment.save();
  
      const populatedComment = await newComment.populate('userId', 'username');
  
      res.status(201).json({
        data: {
          ...populatedComment.toObject(),
          user: populatedComment.userId,
          userId: undefined
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error posting comment', error });
    }
  };
module.exports = {
  getComments,
  postComment
};
