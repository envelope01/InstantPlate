const restaurantService = require('../services/restaurantService');
const catchAsync = require('../utils/catchAsync');

exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await restaurantService.getRestaurantBySlugOrId(req.params.slugOrId);
  res.status(200).json({
    status: 'success',
    data: { restaurant }
  });
});

exports.getMyRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { restaurant }
  });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await restaurantService.updateRestaurant(req.params.id, req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { restaurant }
  });
});

exports.addTable = catchAsync(async (req, res, next) => {
  const { tableName } = req.body;
  const restaurant = await restaurantService.addTable(req.params.id, req.user.id, tableName);
  res.status(200).json({
    status: 'success',
    data: { restaurant }
  });
});

exports.removeTable = catchAsync(async (req, res, next) => {
  const { tableName } = req.body;
  const restaurant = await restaurantService.removeTable(req.params.id, req.user.id, tableName);
  res.status(200).json({
    status: 'success',
    data: { restaurant }
  });
});
