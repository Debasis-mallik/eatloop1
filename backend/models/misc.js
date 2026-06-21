const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  foodRating: { type: Number, required: true, min: 1, max: 5 },
  deliveryRating: { type: Number, min: 1, max: 5 },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  sentimentScore: Number,
  isFlagged: { type: Boolean, default: false },
  isFakeDetected: { type: Boolean, default: false },
  restaurantReply: { text: String, repliedAt: Date },
  isVerifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true });

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: Number,
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  validFrom: { type: Date, required: true },
  validTill: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  applicableUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  firstOrderOnly: { type: Boolean, default: false }
}, { timestamps: true });

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'promo', 'system', 'delivery', 'payment'], default: 'system' },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Review, Coupon, Notification };
