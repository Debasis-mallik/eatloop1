const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  images: [String],
  cuisine: [String],
  categories: [String],
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  openingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  deliveryTime: { min: Number, max: Number },
  deliveryFee: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  isVegOnly: { type: Boolean, default: false },
  isPureVeg: { type: Boolean, default: false },
  fssaiLicense: String,
  gstNumber: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  isOpen: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  preparationTime: { type: Number, default: 20 }
}, { timestamps: true });

restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ name: 'text', cuisine: 'text', tags: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
