const mongoose = require("mongoose");

const EntryFeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: "Auction",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["stripe", "wallet"],
    required: true
  },
  paymentIntentId: String, // For Stripe payments
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index for user and auction
EntryFeeSchema.index({ user: 1, auction: 1 }, { unique: true });

module.exports = mongoose.model("EntryFee", EntryFeeSchema);