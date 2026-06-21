const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, preferences, addresses } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, preferences, addresses }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/wishlist/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.itemId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(req.params.itemId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;