const express = require('express');
const router = express.Router();
const { 
  getWallet, 
  addFunds, 
  confirmDeposit, 
  withdrawFunds,

} = require('../controllers/wallet.controller');
const {
  payEntryFeeWithWallet
}=require("../controllers/payment.controller")
const { protect } = require('../middleware/auth');
router.get('/pay-entry/wallet/:auctionId', protect, payEntryFeeWithWallet);
router.get('/', protect, getWallet);
router.post('/add-funds', protect, addFunds);
router.post('/confirm-deposit', protect, confirmDeposit);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;