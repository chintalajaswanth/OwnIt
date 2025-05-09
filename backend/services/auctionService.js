const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { SOCKET_EVENTS } = require('../config/config');
const socketService = require('./socketService')

// Process auto bids when a new bid is placed
exports.processAutoBids = async (auctionId, newBidAmount) => {
  const auction = await Auction.findById(auctionId).populate('bids');
  
  if (!auction) return;
  
  // Find all auto bids where maxAutoBid > newBidAmount
  const autoBids = auction.bids.filter(
    bid => bid.isAutoBid && bid.maxAutoBid > newBidAmount && bid.bidder.toString() !== auction.winner?.toString()
  );
  
  for (const autoBid of autoBids) {
    const increment = 1; // Minimum bid increment
    const nextBidAmount = newBidAmount + increment;
    
    if (nextBidAmount <= autoBid.maxAutoBid) {
      // Create new bid from auto bid
      const bid = await Bid.create({
        auction: auctionId,
        bidder: autoBid.bidder,
        amount: nextBidAmount,
        isAutoBid: true
      });
      
      // Update auction
      auction.currentPrice = nextBidAmount;
      auction.bids.push(bid._id);
      await auction.save();
      
      // Notify previous highest bidder
      await Notification.create({
        recipient: autoBid.bidder,
        type: 'outbid',
        relatedAuction: auction._id,
        message: `You've been outbid on ${auction.product.name}. Current bid is now $${nextBidAmount}`
      });
      
      // Emit new bid event
      socketService.emitToRoom(
        `auction_${auction._id}`,
        SOCKET_EVENTS.NEW_BID,
        bid
      );
      
      // Recursively process auto bids for the new bid amount
      await this.processAutoBids(auctionId, nextBidAmount);
      break; // Only one auto bid should respond at a time
    }
  }
};

// Check for expired auctions and end them
exports.checkExpiredAuctions = async () => {
  const now = new Date();
  const expiredAuctions = await Auction.find({
    endTime: { $lte: now },
    status: 'active'
  }).populate('bids');
  
  for (const auction of expiredAuctions) {
    // End the auction
    auction.status = 'completed';
    
    // Find the highest bid
    if (auction.bids.length > 0) {
      const highestBid = auction.bids.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      auction.winner = highestBid.bidder;
      auction.currentPrice = highestBid.amount;
    }
    
    await auction.save();
    
    // Notify participants
    // ... (similar to the endAuction controller logic)
    
    // Emit auction end event
    socketService.emitToRoom(
      `auction_${auction._id}`,
      SOCKET_EVENTS.AUCTION_END,
      auction
    );
  }
};