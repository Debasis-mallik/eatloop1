const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  addresses: [{
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number },
    isDefault: { type: Boolean, default: false }
  }],
  preferences: {
    dietType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'all'], default: 'all' },
    cuisines: [String],
    allergies: [String]
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  loyaltyPoints: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  otp: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
