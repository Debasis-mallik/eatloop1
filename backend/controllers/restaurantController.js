const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc Get all restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, city, rating, sort, page = 1, limit = 12 } = req.query;
    let query = { status: 'approved' };

    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (rating) query.rating = { $gte: parseFloat(rating) };

    let sortQuery = {};
    if (sort === 'rating') sortQuery = { rating: -1 };
    else if (sort === 'delivery_time') sortQuery = { 'deliveryTime.min': 1 };
    else if (sort === 'price') sortQuery = { deliveryFee: 1 };
    else sortQuery = { isFeatured: -1, rating: -1 };

    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort(sortQuery).skip(skip).limit(parseInt(limit)).populate('owner', 'name email'),
      Restaurant.countDocuments(query)
    ]);

    res.json({ success: true, restaurants, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
    const categories = [...new Set(menuItems.map(item => item.category))];
    res.json({ success: true, restaurant, menuItems, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a restaurant registered' });
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get restaurant dashboard analytics
exports.getRestaurantAnalytics = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [todayOrders, weekOrders, monthOrders, totalOrders] = await Promise.all([
      Order.find({ restaurant: restaurant._id, createdAt: { $gte: today }, status: { $ne: 'cancelled' } }),
      Order.find({ restaurant: restaurant._id, createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } }),
      Order.find({ restaurant: restaurant._id, createdAt: { $gte: monthAgo }, status: { $ne: 'cancelled' } }),
      Order.countDocuments({ restaurant: restaurant._id })
    ]);

    // Top items
    const topItems = await Order.aggregate([
      { $match: { restaurant: restaurant._id, status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Revenue by day (last 7 days)
    const revenueByDay = await Order.aggregate([
      { $match: { restaurant: restaurant._id, createdAt: { $gte: weekAgo }, status: 'delivered' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const calcRevenue = (orders) => orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    res.json({
      success: true,
      analytics: {
        today: { orders: todayOrders.length, revenue: calcRevenue(todayOrders) },
        week: { orders: weekOrders.length, revenue: calcRevenue(weekOrders) },
        month: { orders: monthOrders.length, revenue: calcRevenue(monthOrders) },
        total: { orders: totalOrders, revenue: restaurant.totalRevenue },
        topItems,
        revenueByDay,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Toggle restaurant open/close
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({ success: true, isOpen: restaurant.isOpen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get nearby restaurants
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const restaurants = await Restaurant.find({
      status: 'approved',
      'address.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000
        }
      }
    }).limit(20);
    res.json({ success: true, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
