const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (Customers post review ratings)
router.post('/', feedbackController.createFeedback);

// Protected routes (Owners view feedbacks & analytical summaries)
router.get('/', protect, feedbackController.getRestaurantFeedback);
router.get('/metrics', protect, feedbackController.getMetrics);

module.exports = router;
