// paymentRoutes.js
const express = require('express');
const paymentRouter = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

paymentRouter.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.create({ amount: amount * 100, currency });
      return res.json({ success: true, clientSecret: paymentIntent.client_secret });
    }
    // Mock for development
    res.json({ success: true, clientSecret: `mock_secret_${Date.now()}`, mock: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

paymentRouter.post('/verify', protect, async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    await Order.findByIdAndUpdate(orderId, { 'payment.status': 'completed', 'payment.transactionId': transactionId, 'payment.paidAt': new Date() });
    res.json({ success: true, message: 'Payment verified' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// reviewRoutes.js
const reviewRouter = express.Router();
const { Review } = require('../models/misc');
const Restaurant = require('../models/Restaurant');

reviewRouter.post('/', protect, async (req, res) => {
  try {
    const { restaurantId, orderId, foodRating, deliveryRating, overallRating, title, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this order' });

    // Simple sentiment
    const positiveWords = ['great','excellent','amazing','delicious','wonderful','perfect','fresh','tasty','love','best'];
    const negativeWords = ['bad','terrible','awful','disgusting','horrible','worst','cold','stale','late','slow'];
    const words = comment.toLowerCase().split(/\s+/);
    const pos = words.filter(w => positiveWords.includes(w)).length;
    const neg = words.filter(w => negativeWords.includes(w)).length;
    const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';

    const review = await Review.create({ user: req.user._id, restaurant: restaurantId, order: orderId, foodRating, deliveryRating, overallRating, title, comment, sentiment });

    const allReviews = await Review.find({ restaurant: restaurantId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

reviewRouter.get('/restaurant/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// couponRoutes.js
const couponRouter = express.Router();
const { Coupon } = require('../models/misc');

couponRouter.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.validTill) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

    let discount = coupon.discountType === 'percentage' ? (orderAmount * coupon.discountValue) / 100 : coupon.discountValue;
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

    res.json({ success: true, coupon, discount: Math.round(discount) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

couponRouter.get('/', protect, async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, validTill: { $gte: new Date() } });
    res.json({ success: true, coupons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// notificationRoutes.js
const notifRouter = express.Router();
const { Notification } = require('../models/misc');

notifRouter.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

notifRouter.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

notifRouter.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = { paymentRouter, reviewRouter, couponRouter, notifRouter };
