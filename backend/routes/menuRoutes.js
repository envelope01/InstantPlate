const express = require('express');
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Category sections
router.post('/sections', protect, menuController.createSection);
router.patch('/sections/:id', protect, menuController.updateSection);
router.delete('/sections/:id', protect, menuController.deleteSection);

// Menu items
router.post('/items', protect, menuController.createMenuItem);
router.patch('/items/:id', protect, menuController.updateMenuItem);
router.delete('/items/:id', protect, menuController.deleteMenuItem);

module.exports = router;
