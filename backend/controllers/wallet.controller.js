const Wallet = require('../models/Wallet');
const User = require('../models/User');
const stripe = require('../config/stripe');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user wallet
// @route   GET /api/v1/wallet
// @access  Private
exports.getWallet = asyncHandler(async (req, res, next) => {
  let wallet = await Wallet.findOne({ user: req.user.id });
  
  // If wallet doesn't exist, create it
  if (!wallet) {
    wallet = await Wallet.create({ user: req.user.id });
  }
  
  res.status(200).json({
    success: true,
    data: wallet
  });
});

// @desc    Add funds to wallet
// @route   POST /api/v1/wallet/add-funds
// @access  Private
exports.addFunds = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please provide a valid amount', 400));
  }
  
  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents/paisa
      currency: 'inr',
      metadata: { userId: req.user.id, purpose: 'wallet_deposit' },
    });
    
    // Find or create wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }
    
    // Add transaction record (will be updated when payment completes)
    wallet.transactions.push({
      type: 'deposit',
      amount,
      status: 'pending'
    });
    
    await wallet.save();
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    return next(new ErrorResponse('Payment processing error', 500));
  }
});

// @desc    Process successful wallet deposit
// @route   POST /api/v1/wallet/confirm-deposit
// @access  Private
exports.confirmDeposit = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, amount } = req.body;
  
  try {
    // Verify payment with Stripe (optional - could be done via webhook instead)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return next(new ErrorResponse('Payment not completed', 400));
    }
    
    // Update wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return next(new ErrorResponse('Wallet not found', 404));
    }
    
    // Find the pending transaction and update it
    const transactionIndex = wallet.transactions.findIndex(
      t => t.type === 'deposit' && t.status === 'pending'
    );
    
    if (transactionIndex !== -1) {
      wallet.transactions[transactionIndex].status = 'completed';
    } else {
      // If no pending transaction found, create a new one
      wallet.transactions.push({
        type: 'deposit',
        amount: amount,
        status: 'completed'
      });
    }
    
    // Update wallet balance
    wallet.balance += Number(amount);
    
    await wallet.save();
    
    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (err) {
    return next(new ErrorResponse('Error processing deposit', 500));
  }
});

// @desc    Withdraw funds from wallet
// @route   POST /api/v1/wallet/withdraw
// @access  Private
exports.withdrawFunds = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please provide a valid amount', 400));
  }
  
  const wallet = await Wallet.findOne({ user: req.user.id });
  
  if (!wallet) {
    return next(new ErrorResponse('Wallet not found', 404));
  }
  
  if (wallet.balance < amount) {
    return next(new ErrorResponse('Insufficient funds', 400));
  }
  
  // Add transaction record
  wallet.transactions.push({
    type: 'withdrawal',
    amount,
    status: 'completed'
  });
  
  // Update wallet balance
  wallet.balance -= Number(amount);
  
  await wallet.save();
  
  res.status(200).json({
    success: true,
    data: wallet
  });
});