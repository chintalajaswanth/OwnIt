const stripe = require('../config/stripe');
const Auction = require('../models/Auction');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const EntryPayment = require('../models/EntryPayment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Pay entry fee via Stripe
exports.payEntryFee = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new ErrorResponse('Auction not found', 404));
  }

  const amount = 100 * 100; // ₹100 in paise
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'inr',
    metadata: { auctionId, userId: req.user.id },
  });

  await EntryPayment.create({
    user: req.user.id,
    auction: auctionId,
    amount: 100,
    paymentIntentId: paymentIntent.id,
    status: 'paid',
    paymentMethod: 'stripe',
  });

  res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
});

// Refund entry fee (Stripe payments)
exports.refundEntryFee = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const payment = await EntryPayment.findOne({ user: req.user.id, auction: auctionId });

  if (!payment || payment.status !== 'succeeded') {
    return next(new ErrorResponse('No completed payment found', 400));
  }

  await stripe.refunds.create({ payment_intent: payment.paymentIntentId });
  payment.status = 'refunded';
  await payment.save();

  res.status(200).json({ success: true, message: 'Refund successful' });
});

// Check entry fee status
exports.checkEntryFeeStatus = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const entry = await EntryPayment.findOne({ user: req.user.id, auction: auctionId });

  if (!entry) {
    return res.status(200).json({ paid: false });
  }

  res.status(200).json({ paid: entry.status === 'paid' });
});

// Get all entry fees for an auction
exports.getEntryFees = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const auction = await Auction.findById(auctionId);

  if (!auction) {
    return next(new ErrorResponse('Auction not found', 404));
  }

  const entryFees = await EntryPayment.find({ auction: auctionId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: entryFees.length,
    data: entryFees,
  });
});

// Get logged in user's all entry fees
exports.getUserEntryFees = asyncHandler(async (req, res, next) => {
  const entryFees = await EntryPayment.find({ user: req.user.id })
    .populate('auction', 'title startDate endDate')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: entryFees.length,
    data: entryFees,
  });
});

// Pay entry fee using Wallet
exports.payEntryFeeWithWallet = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new ErrorResponse('Auction not found', 404));
  }

  const existingPayment = await EntryPayment.findOne({
    user: req.user.id,
    auction: auctionId,
    status: 'paid',
  });

  if (existingPayment) {
    return next(new ErrorResponse('Entry fee already paid for this auction', 400));
  }

  const wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet || wallet.balance < auction.entryFees) {
    return next(new ErrorResponse('Insufficient wallet balance', 400));
  }

  // Deduct from wallet
  wallet.balance -= auction.entryFees;
  wallet.transactions.push({
    type: 'fee_payment',
    amount: auction.entryFees,
    relatedAuction: auctionId,
    status: 'completed',
  });
  await wallet.save();

  const payment = await EntryPayment.create({
    user: req.user.id,
    auction: auctionId,
    amount: auction.entryFees,
    status: 'paid',
    paymentMethod: 'wallet',
    transactionId: `wallet-${Date.now()}-${req.user.id.substring(0, 6)}`
  });

  if (!auction.participants.includes(req.user.id)) {
    auction.participants.push(req.user.id);
    await auction.save();
  }

  res.status(200).json({
    success: true,
    message: 'Entry fee paid from wallet successfully',
    data: payment,
  });
});

// Process auction end refunds
exports.processAuctionEndRefunds = asyncHandler(async (auctionId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new Error(`Auction not found with id ${auctionId}`);
  }

  const winnerId = auction.winner ? auction.winner.toString() : null;
  const entryPayments = await EntryPayment.find({ auction: auctionId, status: 'paid' });

  for (const payment of entryPayments) {
    if (winnerId && payment.user.toString() === winnerId) {
      continue; // Skip winner
    }

    if (payment.paymentMethod === 'stripe' && payment.paymentIntentId) {
      await stripe.refunds.create({ payment_intent: payment.paymentIntentId });
      payment.status = 'refunded';
      await payment.save();
    } else if (payment.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ user: payment.user });
      if (wallet) {
        wallet.balance += payment.amount;
        wallet.transactions.push({
          type: 'refund',
          amount: payment.amount,
          relatedAuction: auctionId,
          status: 'completed',
        });
        await wallet.save();
      }
      payment.status = 'refunded';
      await payment.save();
    }
  }

  return { refundCount: entryPayments.length };
});

// Get wallet balance
exports.getWalletBalance = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    return next(new ErrorResponse('Wallet not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      balance: wallet.balance,
      transactions: wallet.transactions
    },
  });
});

// Add funds to wallet (create paymentIntent)
exports.addFundsToWallet = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please provide a valid amount', 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'inr',
    metadata: { userId: req.user.id, purpose: 'wallet_funding' },
  });

  res.status(200).json({
    success: true,
    message: 'Payment intent created for wallet funding',
    clientSecret: paymentIntent.client_secret,
  });
});

// Confirm wallet funding after Stripe success
exports.confirmWalletFunding = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, amount } = req.body;

  if (!paymentIntentId || !amount) {
    return next(new ErrorResponse('Payment intent ID and amount are required', 400));
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new ErrorResponse('Payment not successful', 400));
  }

  let wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) {
    wallet = await Wallet.create({ user: req.user.id, balance: 0, transactions: [] });
  }

  wallet.balance += Number(amount);
  wallet.transactions.push({
    type: 'deposit',
    amount: Number(amount),
    status: 'completed',
  });
  await wallet.save();

  res.status(200).json({
    success: true,
    message: 'Wallet funded successfully',
    data: {
      balance: wallet.balance,
    },
  });
});
