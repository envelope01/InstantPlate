const feedbackService = require('../services/feedbackService');
const catchAsync = require('../utils/catchAsync');

exports.createFeedback = catchAsync(async (req, res, next) => {
  const { restaurantId, rating, comment, customerName } = req.body;
  const feedback = await feedbackService.createFeedback(restaurantId, rating, comment, customerName);

  res.status(201).json({
    status: 'success',
    data: { feedback }
  });
});

exports.getRestaurantFeedback = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.query;
  const feedbacks = await feedbackService.getRestaurantFeedback(restaurantId, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { feedbacks }
  });
});

exports.getMetrics = catchAsync(async (req, res, next) => {
  const { restaurantId } = req.query;
  const metrics = await feedbackService.getRestaurantMetrics(restaurantId, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { metrics }
  });
});
