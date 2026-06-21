// menuRoutes.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId, isAvailable: true });
    res.json({ success: true, items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
    res.status(201).json({ success: true, item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const items = await MenuItem.find({ $text: { $search: q }, isAvailable: true })
      .populate('restaurant', 'name logo rating address deliveryFee status')
      .limit(20);
    res.json({ success: true, items: items.filter(i => i.restaurant?.status === 'approved') });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
