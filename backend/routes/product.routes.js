const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products and create a new product (with image upload)
router
  .route('/')
  .get(getProducts)  // Get all products
  .post(protect, authorize('seller', 'admin'), upload.single('image'), createProduct);  // Create product with image upload

// Get, update, and delete a product by ID (with image upload for update)
router
  .route('/:id')
  .get(getProduct)  // Get a single product by ID
  .put(protect, authorize('seller', 'admin'), upload.single('image'), updateProduct)  // Update product (with image upload)
  .delete(protect, authorize('seller', 'admin'), deleteProduct); 
// Approve or reject a product (admin only)
router
  .route('/:id/approve')
  .put(protect, authorize('admin'), approveProduct);  // Admin approve product

router
  .route('/:id/reject')
  .put(protect, authorize('admin'), rejectProduct);  // Admin reject product

module.exports = router;
