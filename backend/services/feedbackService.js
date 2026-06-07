const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class FeedbackService {
  async checkOwnership(restaurantId, ownerId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    if (restaurant.ownerId !== ownerId) {
      throw new AppError('Unauthorized', 403);
    }
  }

  async createFeedback(restaurantId, rating, comment, customerName = 'Anonymous') {
    if (!restaurantId || !rating) {
      throw new AppError('Restaurant ID and rating are required', 400);
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new AppError('Rating must be an integer between 1 and 5', 400);
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return await prisma.feedback.create({
      data: {
        restaurantId,
        customerName: customerName || 'Anonymous',
        rating: Math.round(ratingNum),
        comment
      }
    });
  }

  async getRestaurantFeedback(restaurantId, ownerId) {
    await this.checkOwnership(restaurantId, ownerId);

    return await prisma.feedback.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRestaurantMetrics(restaurantId, ownerId) {
    await this.checkOwnership(restaurantId, ownerId);

    // 1) Fetch total orders and total revenue
    const orders = await prisma.order.findMany({
      where: { restaurantId, status: { not: 'CANCELLED' } }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2) Fetch average rating
    const feedbacks = await prisma.feedback.findMany({
      where: { restaurantId }
    });

    const averageRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    // 3) Count pending service requests
    const pendingRequests = await prisma.serviceRequest.count({
      where: { restaurantId, status: 'PENDING' }
    });

    // 4) Count active menu items
    const menuItemsCount = await prisma.menuItem.count({
      where: { restaurantId }
    });

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: feedbacks.length,
      pendingRequests,
      menuItemsCount
    };
  }
}

module.exports = new FeedbackService();
