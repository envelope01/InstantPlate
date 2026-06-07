const serviceRequestService = require('../services/serviceRequestService');
const catchAsync = require('../utils/catchAsync');

exports.createRequest = catchAsync(async (req, res, next) => {
  const { restaurantId, table, type, paymentMethod } = req.body;
  const request = await serviceRequestService.createRequest(restaurantId, table, type, paymentMethod);

  res.status(201).json({
    status: 'success',
    data: { request }
  });
});

exports.getRestaurantRequests = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.query;
  const requests = await serviceRequestService.getRestaurantRequests(restaurantId, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { requests }
  });
});

exports.resolveRequest = catchAsync(async (req, res, next) => {
  const request = await serviceRequestService.resolveRequest(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { request }
  });
});
