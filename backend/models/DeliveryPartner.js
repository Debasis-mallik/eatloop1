const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, enum: ['bicycle', 'motorcycle', 'car', 'scooter'], required: true },
  vehicleNumber: { type: String, required: true },
  drivingLicense: { type: String, required: true },
  aadharNumber: { type: String },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  earnings: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    date: Date,
    type: { type: String, enum: ['delivery', 'tip', 'bonus'] }
  }]
}, { timestamps: true });

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
