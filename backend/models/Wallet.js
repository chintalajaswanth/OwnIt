const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'fee_payment', 'refund', 'bid_hold', 'bid_release'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    relatedAuction: {
      type: mongoose.Schema.ObjectId,
      ref: "Auction"
    },
    relatedEntryFee: {
      type: mongoose.Schema.ObjectId,
      ref: "EntryFee"
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Wallet", WalletSchema);