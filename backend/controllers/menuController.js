const menuService = require('../services/menuService');
const catchAsync = require('../utils/catchAsync');

// ==========================================
// SECTIONS (CATEGORIES)
// ==========================================

exports.createSection = catchAsync(async (req, res, next) => {
  const { restaurantId, name, description, sortOrder } = req.body;
  const section = await menuService.createSection(restaurantId, req.user.id, name, description, sortOrder);

  res.status(201).json({
    status: 'success',
    data: { section }
  });
});

exports.updateSection = catchAsync(async (req, res, next) => {
  const section = await menuService.updateSection(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { section }
  });
});

exports.deleteSection = catchAsync(async (req, res, next) => {
  await menuService.deleteSection(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ==========================================
// ITEMS
// ==========================================

exports.createMenuItem = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.body;
  const item = await menuService.createMenuItem(restaurantId, req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { item }
  });
});

exports.updateMenuItem = catchAsync(async (req, res, next) => {
  const item = await menuService.updateMenuItem(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { item }
  });
});

exports.deleteMenuItem = catchAsync(async (req, res, next) => {
  await menuService.deleteMenuItem(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
