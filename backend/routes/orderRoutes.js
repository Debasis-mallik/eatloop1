const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, updateOrderStatus, cancelOrder, getRestaurantOrders, rateOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/restaurant', protect, authorize('restaurant_owner'), getRestaurantOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/rate', protect, rateOrder);

module.exports = router;
