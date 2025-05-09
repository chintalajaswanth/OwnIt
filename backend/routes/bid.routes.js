const express = require('express');
const {
  getBids,
  getBid,
  createBid,
  setAutoBid
} = require('../controllers/bid.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getBids);

router.route('/:id')
  .get(getBid);

router.route('/auctions/:auctionId/bids')
  .get(getBids)
  .post(protect, authorize('bidder'), createBid);

router.route('/auctions/:auctionId/autobid')
  .post(protect, authorize('bidder'), setAutoBid);

module.exports = router;