const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// Dashboard stats
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalUsers, totalRestaurants, totalOrders, todayOrders, pendingRestaurants, pendingDelivery, revenue] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Restaurant.countDocuments({ status: 'pending' }),
      DeliveryPartner.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }])
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('customer', 'name').populate('restaurant', 'name');
    res.json({ success: true, stats: { totalUsers, totalRestaurants, totalOrders, todayOrders, pendingRestaurants, pendingDelivery, totalRevenue: revenue[0]?.total || 0 }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Manage restaurants
router.get('/restaurants', ...adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, restaurants });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/restaurants/:id/status', ...adminOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, restaurant });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Manage users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Manage delivery partners
router.get('/delivery-partners', ...adminOnly, async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().populate('user', 'name email phone');
    res.json({ success: true, partners });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/delivery-partners/:id/status', ...adminOnly, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, partner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Revenue analytics
router.get('/revenue', ...adminOnly, async (req, res) => {
  try {
    const monthly = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    res.json({ success: true, monthly });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
