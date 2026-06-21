const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

// @desc Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: role || 'customer' });
    const token = generateToken(user._id);

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to EATLOOP!',
        html: `<h2>Welcome ${name}!</h2><p>Your account has been created successfully. Start exploring delicious food around you!</p>`
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - EATLOOP',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Valid for 10 minutes.</p>`
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
