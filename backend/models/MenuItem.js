const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: true },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  tags: [String],
  allergens: [String],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  customizations: [{
    name: String,
    options: [{
      name: String,
      price: Number
    }],
    required: Boolean,
    maxSelect: Number
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalOrders: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 15 }
}, { timestamps: true });

menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
