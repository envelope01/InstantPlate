const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-restaurant', protect, restaurantController.getMyRestaurant);
router.get('/:slugOrId', restaurantController.getRestaurant);

router.patch('/:id', protect, restaurantController.updateRestaurant);
router.post('/:id/tables', protect, restaurantController.addTable);
router.delete('/:id/tables', protect, restaurantController.removeTable);

module.exports = router;
