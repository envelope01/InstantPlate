const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { restaurantId, table, items, notes } = req.body;
  const order = await orderService.createOrder(restaurantId, table, items, notes);

  res.status(201).json({
    status: 'success',
    data: { order }
  });
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.query;
  const orders = await orderService.getRestaurantOrders(restaurantId, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { orders }
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, req.user.id, status);

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});
