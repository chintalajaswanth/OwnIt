const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  basePrice: {
    type: Number,
    required: [true, "Please add a base price"],
    min: [0, "Base price cannot be negative"]
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.basePrice;
    }
  },
  buyNowPrice: {
    type: Number,
    min: [0, "Buy now price cannot be negative"]
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending"
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid"
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom"
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  entryFees:{
    type:Number,
    required:true
  },
  lastBidTime: {
    type: Date
  },
}, { timestamps: true });

AuctionSchema.index({ endTime: 1 });

module.exports = mongoose.model("Auction", AuctionSchema);
