const mongoose = require('mongoose');
// Product Schema (Single image instead of an array)
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  image: {  // Single image field
    type: String,
    default: ""
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    required: [true, 'Please specify condition']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_auction', 'sold'],
    default: 'pending'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rejectionReason: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', ProductSchema);
