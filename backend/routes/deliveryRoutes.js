const express = require('express');
const router = express.Router();
const DeliveryPartner = require('../models/DeliveryPartner');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', protect, async (req, res) => {
  try {
    const existing = await DeliveryPartner.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered' });
    const partner = await DeliveryPartner.create({ ...req.body, user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { role: 'delivery_partner' });
    res.status(201).json({ success: true, partner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/location', protect, async (req, res) => {
  try {
    const { lat, lng, orderId } = req.body;
    await DeliveryPartner.findOneAndUpdate({ user: req.user._id }, { currentLocation: { type: 'Point', coordinates: [lng, lat] } });
    if (orderId) req.app.get('io')?.to(`order_${orderId}`).emit('delivery_location_update', { lat, lng, orderId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, partner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/toggle-online', protect, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ success: false, message: 'Not found' });
    partner.isOnline = !partner.isOnline;
    await partner.save();
    res.json({ success: true, isOnline: partner.isOnline });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
