const express = require('express');
const serviceRequestController = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (Customers call waiter/request bill)
router.post('/', serviceRequestController.createRequest);

// Protected routes (Owners view/resolve)
router.get('/', protect, serviceRequestController.getRestaurantRequests);
router.patch('/:id/resolve', protect, serviceRequestController.resolveRequest);

module.exports = router;
