const express = require('express');
const router = express.Router();
const { getRecommendations, analyzeSentiment, getDemandForecast, getNutritionInfo, predictDeliveryTime, detectFraud } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommendations', protect, getRecommendations);
router.post('/sentiment', protect, analyzeSentiment);
router.get('/demand-forecast', protect, authorize('restaurant_owner'), getDemandForecast);
router.post('/nutrition', protect, getNutritionInfo);
router.post('/predict-delivery', predictDeliveryTime);
router.post('/fraud-detect', protect, detectFraud);

module.exports = router;
