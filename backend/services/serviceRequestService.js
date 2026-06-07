const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class ServiceRequestService {
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

  async createRequest(restaurantId, table, type, paymentMethod = null) {
    if (!restaurantId || !table || !type) {
      throw new AppError('Restaurant ID, table, and request type are required', 400);
    }

    const uppercaseType = type.toUpperCase();
    if (uppercaseType !== 'WAITER' && uppercaseType !== 'BILL') {
      throw new AppError('Invalid request type. Must be WAITER or BILL.', 400);
    }

    if (uppercaseType === 'BILL' && !paymentMethod) {
      throw new AppError('Payment method is required for billing requests', 400);
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return await prisma.serviceRequest.create({
      data: {
        restaurantId,
        table,
        type: uppercaseType,
        paymentMethod: paymentMethod ? paymentMethod.toLowerCase() : null,
        status: 'PENDING'
      }
    });
  }

  async getRestaurantRequests(restaurantId, ownerId) {
    await this.checkOwnership(restaurantId, ownerId);

    return await prisma.serviceRequest.findMany({
      where: {
        restaurantId,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async resolveRequest(requestId, ownerId) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Service request not found', 404);
    }

    await this.checkOwnership(request.restaurantId, ownerId);

    return await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'RESOLVED' }
    });
  }
}

module.exports = new ServiceRequestService();
