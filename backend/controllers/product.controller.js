const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require('fs');
const path = require('path');

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Seller)
// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Seller)
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add seller to request body
  req.body.seller = req.user.id;
  
  // Handle image upload (single image)
  let image = '';
  if (req.file) {
    image = req.file.filename; // Save the filename for the image
  }

  const productData = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    condition: req.body.condition,
    seller: req.user.id,
    image: image,  // Single image field
    status: 'pending'
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller/Owner or Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Check ownership or admin
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to update this product`, 401)
    );
  }

  // Handle image upload (single image)
  let updatedImage = product.image; // Keep existing image if no new one is uploaded

  if (req.file) {
    updatedImage = req.file.filename;  // Update with new uploaded image
  }

  // Update product fields
  const productData = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    condition: req.body.condition,
    image: updatedImage  // Single image field
  };

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: updatedProduct
  });
});

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find()
    .populate('seller', 'username email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'username email');

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller/Owner or Admin)


// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Seller/Owner or Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Verify ownership or admin
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to delete this product`, 401)
    );
  }

  // Delete product images
  product.images.forEach(image => {
    const imagePath = path.join(__dirname, '../uploads/products/', image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Approve product
// @route   PUT /api/v1/products/:id/approve
// @access  Private (Admin)
exports.approveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Reject product
// @route   PUT /api/v1/products/:id/reject
// @access  Private (Admin)
exports.rejectProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      status: 'rejected',
      rejectionReason: req.body.reason || 'Does not meet requirements',
      approvedBy: req.user.id
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});