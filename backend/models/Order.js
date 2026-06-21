const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, default: () => `EL-${uuidv4().slice(0,8).toUpperCase()}`, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: { type: Number, required: true },
    customizations: [{
      name: String,
      selected: String,
      price: Number
    }],
    totalPrice: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  deliveryAddress: {
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  payment: {
    method: { type: String, enum: ['cod', 'stripe', 'razorpay', 'wallet'], default: 'cod' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },
  pricing: {
    subtotal: Number,
    deliveryFee: Number,
    taxAmount: Number,
    discountAmount: Number,
    couponDiscount: Number,
    total: Number
  },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryDistance: Number,
  specialInstructions: String,
  rating: {
    food: { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  isRefunded: { type: Boolean, default: false },
  cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
