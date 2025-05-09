const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { SOCKET_EVENTS } = require('../config/config');
const socketService = require('../services/socketService');
const { PRODUCT_STATUS } = require('../config/constants');
const { processAuctionEndRefunds } = require('./payment.controller');
// @desc    Get all auctions
// @route   GET /api/v1/auctions
// @route   GET /api/v1/products/:productId/auctions
// @access  Public
exports.getAuctions = asyncHandler(async (req, res, next) => {
  if (req.params.productId) {
    const auctions = await Auction.find({ product: req.params.productId })
      .populate('product')
      .populate('seller');

    return res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  } else {
    const auctions = await Auction.find()
      .populate('product')
      .populate('seller');

    return res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  }
});


// @desc    Get single auction
// @route   GET /api/v1/auctions/:id
// @access  Public


// @desc    Create new auction
// @route   POST /api/v1/products/:productId/auctions
// @access  Private (Seller)
const { ChatRoom } = require('../models/Chat'); // make sure path is correct

exports.createAuction = asyncHandler(async (req, res, next) => {
  try {
    req.body.product = req.params.productId;
    req.body.seller = req.user.id;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(
        new ErrorResponse(`No product with the id of ${req.params.productId}`, 404)
      );
    }

    // Make sure user is product owner
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to create auction for this product`,
          401
        )
      );
    }

    // Check if product is approved
    if (product.status !== PRODUCT_STATUS.APPROVED) {
      return next(
        new ErrorResponse(
          `Product must be approved by admin before creating auction`,
          400
        )
      );
    }

    // Check if auction already exists for this product
    const existingAuction = await Auction.findOne({ product: req.params.productId });

    if (existingAuction) {
      return next(
        new ErrorResponse(
          `Auction already exists for product with id ${req.params.productId}`,
          400
        )
      );
    }

    // Create auction
    const auction = await Auction.create(req.body);

    // Create chat room for the auction
    const chatRoom = await ChatRoom.create({
      auctionId: auction._id,
      participants: [req.user.id], // initially only seller; others can join when bidding
      messages: [],
    });

    // Link chat room to auction
    auction.chatRoom = chatRoom._id;
    await auction.save();

    // Update product status to 'in_auction'
    product.status = PRODUCT_STATUS.IN_AUCTION;
    await product.save();
    setupAutoBidListener(auction);
    res.status(201).json({
      success: true,
      data: auction,
    });
  } catch (err) {
    next(err);
  }
});
exports.getAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id)
    .populate("product")
    .populate("seller")
    .populate("bids")
    .populate("winner")
    .populate("entryFees") // Correctly populating entryFees
    .populate({
      path: "chatRoom",
      populate: [
        { path: "participants" },
        { path: "messages" },
        { path: "lastMessage" },
        { path: "auctionId" }
      ]
    });

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: auction
  });
});
// @desc    Update auction
// @route   PUT /api/v1/auctions/:id
// @access  Private (Seller/Admin)
exports.updateAuction = asyncHandler(async (req, res, next) => {
  let auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is auction owner or admin
  if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this auction`,
        401
      )
    );
  }

  // Prevent updating certain fields if auction is active
  if (auction.status === 'active') {
    const allowedUpdates = ['endTime', 'status'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return next(
        new ErrorResponse(
          `Cannot update auction fields other than endTime and status when auction is active`,
          400
        )
      );
    }
  }

  auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: auction
  });
});

// @desc    Delete auction
// @route   DELETE /api/v1/auctions/:id
// @access  Private (Seller/Admin)
exports.deleteAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is auction owner or admin
  if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this auction`,
        401
      )
    );
  }

  // Can't delete active auctions
  if (auction.status === 'active') {
    return next(
      new ErrorResponse(
        `Cannot delete active auction. End the auction first.`,
        400
      )
    );
  }

  await auction.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Start auction
// @route   PUT /api/v1/auctions/:id/start
// @access  Private (Admin)
exports.startAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  if (auction.status !== 'pending') {
    return next(
      new ErrorResponse(
        `Auction with id ${req.params.id} is not in pending state`,
        400
      )
    );
  }

  auction.status = 'active';
  await auction.save();

  // Notify seller that auction has started
  await Notification.create({
    recipient: auction.seller,
    type: 'auction_start',
    relatedAuction: auction._id,
    message: `Your auction for ${auction.product.name} has started!`
  });

  res.status(200).json({
    success: true,
    data: auction
  });
});

// Set up the auction event listener for auto-bids
const setupAutoBidListener = (auction) => {
  auction.on('newBid', async (newBid) => {
    await autoBidListener(auction, newBid);
  });
};
const autoBidListener = async (auction, newBid) => {
const autoBids = await Bid.find({
  auction: auction._id,
  bidder: newBid.bidder,
  isAutoBid: true,
  maxAutoBid: { $gt: newBid.amount }
}).sort('-amount'); // Get auto-bid with highest amount

// Loop through auto-bids to check if any should place a new bid
for (const autoBid of autoBids) {
  const nextAutoBidAmount = newBid.amount + 1; // Increment by the smallest unit (1)

  if (nextAutoBidAmount <= autoBid.maxAutoBid) {
    // Place the next auto-bid if it's within the max limit
    const nextAutoBid = await Bid.create({
      auction: auction._id,
      bidder: autoBid.bidder,
      amount: nextAutoBidAmount,
      isAutoBid: true,
      maxAutoBid: autoBid.maxAutoBid
    });

    // Update auction bids
    auction.bids.push(nextAutoBid._id);
    await auction.save();

    // Emit new bid event via socket
    socketService.emitToRoom(
      `auction_${auction._id}`,
      SOCKET_EVENTS.NEW_BID,
      nextAutoBid
    );
  }
}
};

// Set up the auction event listener for auto-bids

// @desc    End auction
// @route   PUT /api/v1/auctions/:id/end
// @access  Private (Seller/Admin)
exports.endAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);
  
  if (!auction) {
    return next(new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404));
  }
  
  if (auction.status === 'completed' || auction.status === 'cancelled') {
    return next(new ErrorResponse(`Auction is already ${auction.status}`, 400));
  }
  
  const highestBid = await Bid.findOne({ auction: req.params.id })
    .sort({ amount: -1 })
    .limit(1);
  
  auction.status = 'completed';
  auction.endedBy = req.user ? req.user.id : 'system';
  
  if (highestBid) {
    auction.winner = highestBid.bidder;
    auction.currentPrice = highestBid.amount;
    
    // Add auction to winner's won auctions list
    await User.findByIdAndUpdate(highestBid.bidder, {
      $addToSet: { auctionsWon: auction._id }
    });

    // Create notification for the winner
    await Notification.create({
      recipient: highestBid.bidder,
      type: 'auction_won',
      relatedAuction: auction._id,
      message: `Congratulations! You won the auction for ${auction.product.name}`
    });
  }
  
  await auction.save();
  await processAuctionEndRefunds(req.params.id);
  
  res.status(200).json({
    success: true,
    data: auction
  });
});

// Add to your existing auction controller
// This can be used by a scheduled job to end auctions automatically
exports.endExpiredAuctions = asyncHandler(async (req, res, next) => {
  const now = new Date();
  
  // Find all active auctions that have ended
  const expiredAuctions = await Auction.find({
    status: 'active',
    endTime: { $lte: now }
  });
  
  console.log(`Found ${expiredAuctions.length} expired auctions`);
  
  let endedCount = 0;
  
  for (const auction of expiredAuctions) {
    // Find highest bid
    const highestBid = await Bid.findOne({ auction: auction._id })
      .sort({ amount: -1 })
      .limit(1);
    
    // Update auction
    auction.status = 'completed';
    auction.endedBy = 'system';
    
    if (highestBid) {
      auction.winner = highestBid.bidder;
      auction.currentPrice = highestBid.amount;
    }
    
    await auction.save();
    
    // Process refunds for entry fees (except for winner)
    await processAuctionEndRefunds(auction._id);
    
    endedCount++;
  }
  
  if (req.originalUrl) {
    // If this was called via API endpoint
    res.status(200).json({
      success: true,
      message: `Ended ${endedCount} expired auctions`,
      count: endedCount
    });
  } else {
    // If this was called from a scheduler
    return {
      success: true,
      count: endedCount
    };
  }
});
// @desc    Join auction
// @route   POST /api/v1/auctions/:id/join
// @access  Private (Bidder)

// controllers/auction.controller.js (add this function)
const EntryFee = require("../models/EntryPayment"); // hypothetical model

exports.joinAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if auction is active
  if (auction.status !== 'active') {
    return next(
      new ErrorResponse(`Auction with id ${req.params.id} is not active`, 400)
    );
  }

  // Check if user is already a participant
  if (auction.participants.includes(req.user.id)) {
    return next(
      new ErrorResponse('You are already a participant in this auction', 400)
    );
  }

  // ✅ Check if user has paid the entry fee
  const entryFeePaid = await EntryFee.findOne({
    auction: auction._id,
    user: req.user.id,
    status: 'paid' // only allow if payment was successful
  });

  if (!entryFeePaid) {
    return next(
      new ErrorResponse('You must pay the entry fee before joining this auction', 403)
    );
  }

  // Add user to participants
  auction.participants.push(req.user.id);
  await auction.save();

  res.status(200).json({
    success: true,
    data: auction
  });
});
