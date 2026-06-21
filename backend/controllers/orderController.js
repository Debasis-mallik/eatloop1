const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const DeliveryPartner = require('../models/DeliveryPartner');
const { Notification } = require('../models/misc');

// @desc Place an order
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, couponId, specialInstructions } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({ success: false, message: 'Restaurant is not available' });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `${menuItem?.name || 'Item'} is not available` });
      }
      const itemPrice = menuItem.discountedPrice || menuItem.price;
      const customizationTotal = (item.customizations || []).reduce((sum, c) => sum + (c.price || 0), 0);
      const totalPrice = (itemPrice + customizationTotal) * item.quantity;
      subtotal += totalPrice;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: itemPrice,
        quantity: item.quantity,
        customizations: item.customizations,
        totalPrice
      });
    }

    const deliveryFee = restaurant.deliveryFee || 30;
    const taxAmount = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + taxAmount;

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      deliveryAddress,
      payment: { method: paymentMethod },
      pricing: { subtotal, deliveryFee, taxAmount, discountAmount: 0, couponDiscount: 0, total },
      coupon: couponId || undefined,
      specialInstructions,
      estimatedDeliveryTime: new Date(Date.now() + (restaurant.deliveryTime?.max || 45) * 60000),
      statusHistory: [{ status: 'pending', note: 'Order placed' }]
    });

    // Update restaurant stats
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalOrders: 1, totalRevenue: total } });

    // Update menu item order counts
    for (const item of orderItems) {
      await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { totalOrders: item.quantity } });
    }

    // Notify restaurant (via socket)
    const io = req.app.get('io');
    io?.to(`restaurant_${restaurantId}`).emit('new_order', { orderId: order._id, orderNumber: order.orderNumber });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed!',
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      type: 'order',
      data: { orderId: order._id }
    });

    const populatedOrder = await Order.findById(order._id).populate('restaurant', 'name address logo').populate('items.menuItem', 'name image');

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get user orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let query = { customer: req.user._id };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .populate('restaurant', 'name logo address phone')
        .populate('deliveryPartner', 'name phone'),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name logo address phone')
      .populate('customer', 'name phone email')
      .populate('deliveryPartner', 'name phone')
      .populate('items.menuItem', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === 'delivered') order.actualDeliveryTime = new Date();
    await order.save();

    // Emit socket update
    const io = req.app.get('io');
    io?.to(`order_${order._id}`).emit('order_status_updated', { orderId: order._id, status, note });

    // Notify customer
    await Notification.create({
      user: order.customer,
      title: `Order ${status.replace(/_/g, ' ')}`,
      message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
      type: 'order',
      data: { orderId: order._id }
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    order.cancellationReason = req.body.reason;
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason });
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get restaurant orders (for restaurant owner)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const { status, page = 1, limit = 20 } = req.query;
    let query = { restaurant: restaurant._id };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('customer', 'name phone'),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Rate order
exports.rateOrder = async (req, res) => {
  try {
    const { food, delivery, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only rate delivered orders' });
    }
    order.rating = { food, delivery, review, ratedAt: new Date() };
    await order.save();

    // Update restaurant rating
    const allOrders = await Order.find({ restaurant: order.restaurant, 'rating.food': { $exists: true } });
    const avgRating = allOrders.reduce((sum, o) => sum + (o.rating?.food || 0), 0) / allOrders.length;
    await Restaurant.findByIdAndUpdate(order.restaurant, { rating: Math.round(avgRating * 10) / 10, totalReviews: allOrders.length });

    res.json({ success: true, message: 'Thank you for your rating!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
