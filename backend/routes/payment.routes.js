const express = require('express');
const router = express.Router();
const {
  payEntryFee,
  refundEntryFee,
  checkEntryFeeStatus,
  getEntryFees,
  getUserEntryFees,
  payEntryFeeWithWallet,
  getWalletBalance,
  addFundsToWallet,
  confirmWalletFunding
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

// Entry fee payment routes
router.post('/pay-entry/:auctionId', protect, payEntryFee);
router.post('/refund-entry/:auctionId', protect, authorize('admin'), refundEntryFee);
router.get('/check-entry/:auctionId', protect, checkEntryFeeStatus);
router.get('/pay-entry/status/:auctionId', protect,  getEntryFees);
router.get('/my-entry-fees', protect, getUserEntryFees);

// Wallet routes
router.post('/pay-entry/wallet/:auctionId', protect, payEntryFeeWithWallet);
router.get('/wallet', protect, getWalletBalance);
router.post('/wallet/add-funds', protect, addFundsToWallet);
router.post('/wallet/confirm-funding', protect, confirmWalletFunding);

module.exports = router;
