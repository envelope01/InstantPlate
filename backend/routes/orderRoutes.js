const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (Customers placing orders or tracking status)
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);

// Protected routes (Owners managing tickets)
router.get('/', protect, orderController.getRestaurantOrders);
router.patch('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
