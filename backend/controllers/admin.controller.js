import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Auction from '../models/Auction.js';

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    pendingProducts: await Product.countDocuments({ status: 'pending' }),
    activeAuctions: await Auction.countDocuments({ status: 'active' }),
    totalRevenue: await Auction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$currentPrice" } } }
    ])
  };
  
  res.status(200).json({ success: true, data: stats });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Get pending products
// @route   GET /api/v1/admin/products/pending
export const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('seller', 'username email');
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Approve product
// @route   PUT /api/v1/admin/products/:id/approve
export const approveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: Date.now()
    },
    { new: true }
  ).populate('seller', 'username email');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: product });
});

// @desc    Reject product
// @route   PUT /api/v1/admin/products/:id/reject
export const rejectProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected',
      rejectionReason: req.body.reason,
      approvedBy: req.user.id
    },
    { new: true }
  );

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: product });
});