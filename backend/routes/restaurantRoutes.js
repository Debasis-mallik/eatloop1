const express = require('express');
const router = express.Router();
const {
  getRestaurants, getRestaurant, createRestaurant, updateRestaurant,
  getRestaurantAnalytics, toggleRestaurantStatus, getNearbyRestaurants
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup local storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/restaurants';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isAllowed = allowed.test(path.extname(file.originalname).toLowerCase());
    if (isAllowed) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Image upload route
router.post('/upload', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/restaurants/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, updateRestaurant);
router.get('/owner/analytics', protect, authorize('restaurant_owner'), getRestaurantAnalytics);
router.put('/owner/toggle-status', protect, authorize('restaurant_owner'), toggleRestaurantStatus);

module.exports = router;