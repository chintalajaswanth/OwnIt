const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { SOCKET_EVENTS } = require('../config/config');
const socketService = require('../services/socketService');

// @desc    Get all bids
// @route   GET /api/v1/bids
// @route   GET /api/v1/auctions/:auctionId/bids
// @access  Public
exports.getBids = asyncHandler(async (req, res, next) => {
  if (req.params.auctionId) {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder')
      .sort('-amount');

    return res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single bid
// @route   GET /api/v1/bids/:id
// @access  Public
exports.getBid = asyncHandler(async (req, res, next) => {
  const bid = await Bid.findById(req.params.id).populate('bidder');

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bid
  });
});

// @desc    Create new bid
// @route   POST /api/v1/auctions/:auctionId/bids
// @access  Private (Bidder)
exports.createBid = asyncHandler(async (req, res, next) => {
  req.body.auction = req.params.auctionId;
  req.body.bidder = req.user.id;

  const auction = await Auction.findById(req.params.auctionId);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.auctionId}`, 404)
    );
  }

  // Check if auction is active
  if (auction.status !== 'active') {
    return next(
      new ErrorResponse(
        `Auction with id ${req.params.auctionId} is not active`,
        400
      )
    );
  }

  // Check if auction has ended
  if (auction.endTime < Date.now()) {
    return next(
      new ErrorResponse(
        `Auction with id ${req.params.auctionId} has already ended`,
        400
      )
    );
  }

  // Check if user is a participant
  const isParticipant = auction.participants.some(
    participant => participant.toString() === req.user.id
  );

  if (!isParticipant) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not a participant in this auction. Please join the auction first.`,
        400
      )
    );
  }

  // Check if bid amount is higher than current price
  if (req.body.amount <= auction.currentPrice) {
    return next(
      new ErrorResponse(
        `Bid amount must be higher than current price of $${auction.currentPrice}`,
        400
      )
    );
  }

  // Create bid (Mongoose automatically handles `createdAt` with timestamps: true)
  const bid = await Bid.create(req.body);

  // Update auction current price and last bid time
  auction.currentPrice = req.body.amount;
  auction.lastBidTime = new Date(); // Track last bid time
  auction.bids.push(bid._id);
  await auction.save();

  // Notify previous highest bidder if exists
  const previousHighestBid = await Bid.findOne({
    auction: auction._id,
    bidder: { $ne: req.user.id }
  }).sort('-amount');

  if (previousHighestBid) {
    await Notification.create({
      recipient: previousHighestBid.bidder,
      type: 'outbid',
      relatedAuction: auction._id,
      message: `You've been outbid on ${auction.product.name}. Current bid is now $${req.body.amount}`
    });
  }

  // Notify seller about new bid
  await Notification.create({
    recipient: auction.seller,
    type: 'new_bid',
    relatedAuction: auction._id,
    message: `New bid of $${req.body.amount} placed on ${auction.product.name} at ${bid.createdAt ? bid.createdAt.toLocaleString() : 'Invalid Date'}`
  });

  // Emit new bid event via socket
  socketService.emitToRoom(
    `auction_${auction._id}`,
    SOCKET_EVENTS.NEW_BID,
    {
      ...bid.toObject(),
      bidTime: bid.createdAt ? bid.createdAt.toLocaleString() : 'Invalid Date' // Add validation here
    }
  );

  res.status(201).json({
    success: true,
    data: bid
  });
});


// @desc    Set auto bid
// @route   POST /api/v1/auctions/:auctionId/autobid
// @access  Private (Bidder)
exports.setAutoBid = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.auctionId);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.auctionId}`, 404)
    );
  }

  if (auction.status !== 'active') {
    return next(
      new ErrorResponse(`Auction with id ${req.params.auctionId} is not active`, 400)
    );
  }

  if (auction.endTime < Date.now()) {
    return next(
      new ErrorResponse(`Auction with id ${req.params.auctionId} has already ended`, 400)
    );
  }

  const isParticipant = auction.participants.some(
    (participant) => participant.toString() === req.user.id
  );

  if (!isParticipant) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not a participant in this auction. Please join the auction first.`, 400)
    );
  }

  if (req.body.maxBid <= auction.currentPrice) {
    return next(
      new ErrorResponse(`Max bid amount must be higher than current price of $${auction.currentPrice}`, 400)
    );
  }

  const autoBid = await Bid.create({
    auction: auction._id,
    bidder: req.user.id,
    amount: auction.currentPrice + 1, // Starting increment
    isAutoBid: true,
    maxAutoBid: req.body.maxBid,
  });

  auction.bids.push(autoBid._id);
  await auction.save();

  res.status(201).json({
    success: true,
    data: autoBid
  });
});
