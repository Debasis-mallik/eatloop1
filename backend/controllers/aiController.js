const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { Review } = require('../models/misc');

// Simple ML-like recommendation (collaborative filtering simulation)
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's order history
    const userOrders = await Order.find({ customer: userId, status: 'delivered' })
      .populate('items.menuItem', 'name category tags cuisine')
      .sort({ createdAt: -1 })
      .limit(20);

    // Extract preferences
    const orderedCategories = {};
    const orderedRestaurants = {};
    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          orderedCategories[item.menuItem.category] = (orderedCategories[item.menuItem.category] || 0) + item.quantity;
        }
      });
      orderedRestaurants[order.restaurant] = (orderedRestaurants[order.restaurant] || 0) + 1;
    });

    // Find top categories
    const topCategories = Object.entries(orderedCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    let recommendedItems = [];
    if (topCategories.length > 0) {
      recommendedItems = await MenuItem.find({
        category: { $in: topCategories },
        isAvailable: true
      }).populate('restaurant', 'name logo rating deliveryFee isOpen status')
        .sort({ totalOrders: -1, rating: -1 })
        .limit(12);

      // Filter to only approved restaurants
      recommendedItems = recommendedItems.filter(item => item.restaurant?.status === 'approved' && item.restaurant?.isOpen);
    }

    // If no history, return popular items
    if (recommendedItems.length === 0) {
      recommendedItems = await MenuItem.find({ isAvailable: true })
        .populate('restaurant', 'name logo rating deliveryFee isOpen status')
        .sort({ totalOrders: -1, rating: -1 })
        .limit(12);
      recommendedItems = recommendedItems.filter(item => item.restaurant?.status === 'approved');
    }

    // Featured restaurants
    const featuredRestaurants = await Restaurant.find({ status: 'approved', isFeatured: true }).limit(6);

    res.json({
      success: true,
      recommendations: recommendedItems,
      featuredRestaurants,
      userPreferences: { topCategories, hasHistory: userOrders.length > 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Sentiment analysis on review text (rule-based)
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const positiveWords = ['great', 'excellent', 'amazing', 'delicious', 'wonderful', 'perfect', 'fresh', 'tasty', 'fantastic', 'love', 'best', 'good', 'nice', 'fast', 'hot'];
    const negativeWords = ['bad', 'terrible', 'awful', 'disgusting', 'horrible', 'worst', 'cold', 'stale', 'late', 'slow', 'poor', 'dirty', 'wrong', 'never', 'disappointed'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0, negativeScore = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const total = positiveScore + negativeScore;
    let sentiment, score;
    if (total === 0) { sentiment = 'neutral'; score = 0.5; }
    else {
      score = positiveScore / total;
      if (score >= 0.6) sentiment = 'positive';
      else if (score <= 0.4) sentiment = 'negative';
      else sentiment = 'neutral';
    }

    const aspects = [];
    if (text.toLowerCase().includes('food') || text.toLowerCase().includes('taste')) aspects.push('food quality');
    if (text.toLowerCase().includes('delivery') || text.toLowerCase().includes('fast') || text.toLowerCase().includes('late')) aspects.push('delivery');
    if (text.toLowerCase().includes('price') || text.toLowerCase().includes('value')) aspects.push('value for money');
    if (text.toLowerCase().includes('packaging')) aspects.push('packaging');

    res.json({ success: true, sentiment, score: Math.round(score * 100) / 100, aspects, positiveScore, negativeScore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Demand forecasting (based on order history patterns)
exports.getDemandForecast = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Hourly demand pattern
    const hourlyOrders = await Order.aggregate([
      { $match: { restaurant: restaurant._id, status: 'delivered' } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Day-wise pattern
    const dailyOrders = await Order.aggregate([
      { $match: { restaurant: restaurant._id, status: 'delivered' } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top selling items by time
    const topItemsByDay = await Order.aggregate([
      { $match: { restaurant: restaurant._id, status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Peak hours detection
    const peakHours = hourlyOrders.filter(h => h.count > (hourlyOrders.reduce((a, b) => a + b.count, 0) / hourlyOrders.length));

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = {
      peakHours: peakHours.map(h => ({ hour: h._id, orders: h.count })),
      dailyPattern: dailyOrders.map(d => ({ day: days[d._id - 1], orders: d.count })),
      topSellingItems: topItemsByDay,
      recommendations: []
    };

    const maxDay = dailyOrders.reduce((a, b) => a.count > b.count ? a : b, { count: 0 });
    if (maxDay._id) forecast.recommendations.push(`Stock extra ingredients on ${days[maxDay._id - 1]}s — your busiest day.`);
    const maxHour = hourlyOrders.reduce((a, b) => a.count > b.count ? a : b, { count: 0 });
    if (maxHour._id !== undefined) forecast.recommendations.push(`Prepare extra staff around ${maxHour._id}:00 - ${maxHour._id + 1}:00.`);

    res.json({ success: true, forecast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Nutrition assistant
exports.getNutritionInfo = async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!itemIds || itemIds.length === 0) return res.status(400).json({ success: false, message: 'Item IDs required' });

    const items = await MenuItem.find({ _id: { $in: itemIds } });
    const totalNutrition = items.reduce((acc, item) => {
      if (item.nutrition) {
        acc.calories += item.nutrition.calories || 0;
        acc.protein += item.nutrition.protein || 0;
        acc.carbs += item.nutrition.carbs || 0;
        acc.fat += item.nutrition.fat || 0;
        acc.fiber += item.nutrition.fiber || 0;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const dailyRecommended = { calories: 2000, protein: 50, carbs: 300, fat: 65, fiber: 25 };
    const percentages = {};
    Object.keys(dailyRecommended).forEach(key => {
      percentages[key] = Math.round((totalNutrition[key] / dailyRecommended[key]) * 100);
    });

    const healthScore = totalNutrition.calories < 600 ? 'low calorie' : totalNutrition.calories < 900 ? 'moderate' : 'high calorie';
    const suggestions = [];
    if (totalNutrition.protein < 15) suggestions.push('Consider adding a protein-rich side dish.');
    if (totalNutrition.fiber < 5) suggestions.push('Add a salad or vegetable side for more fiber.');
    if (totalNutrition.calories > 1000) suggestions.push('This meal is high in calories. Consider sharing or a lighter option.');

    res.json({ success: true, nutrition: totalNutrition, percentages, healthScore, suggestions, items: items.map(i => ({ name: i.name, nutrition: i.nutrition })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delivery time prediction
exports.predictDeliveryTime = async (req, res) => {
  try {
    const { restaurantId, distance } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const hour = new Date().getHours();
    const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);
    const baseTime = restaurant.preparationTime || 20;
    const travelTime = Math.round((distance || 5) * 4);
    const peakMultiplier = isPeakHour ? 1.3 : 1;
    const estimatedMinutes = Math.round((baseTime + travelTime) * peakMultiplier);

    res.json({
      success: true,
      prediction: {
        preparationTime: baseTime,
        travelTime,
        totalTime: estimatedMinutes,
        isPeakHour,
        confidence: 0.82,
        range: { min: estimatedMinutes - 5, max: estimatedMinutes + 10 }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fraud detection (simple rule-based)
exports.detectFraud = async (req, res) => {
  try {
    const { type, data } = req.body;
    let isSuspicious = false;
    const flags = [];

    if (type === 'review') {
      const { userId, restaurantId, rating, comment } = data;
      const recentReviews = await Review.find({ user: userId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      if (recentReviews.length >= 5) { isSuspicious = true; flags.push('Multiple reviews in 24h'); }
      if (comment && comment.length < 10) { flags.push('Very short review'); }
      if (rating === 5 && comment?.toLowerCase().includes('amazing') && comment?.toLowerCase().includes('best')) {
        flags.push('Generic positive pattern detected');
      }
    } else if (type === 'transaction') {
      const { amount, userId } = data;
      const recentOrders = await Order.find({ customer: userId, createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
      if (recentOrders.length >= 10) { isSuspicious = true; flags.push('Too many orders in 1 hour'); }
      if (amount > 10000) { flags.push('Unusually high order amount'); }
    }

    res.json({ success: true, isSuspicious, flags, riskLevel: isSuspicious ? 'high' : flags.length > 0 ? 'medium' : 'low' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
