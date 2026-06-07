const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class OrderService {
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

  async createOrder(restaurantId, table, items, notes) {
    if (!restaurantId || !table || !items || !items.length) {
      throw new AppError('Invalid order details. Table number and items are required.', 400);
    }

    // 1) Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // 2) Process items, verify prices, and calculate totalAmount
    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const dbItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!dbItem || dbItem.restaurantId !== restaurantId) {
        throw new AppError(`Item ${item.name || item.menuItemId} is not available.`, 400);
      }

      if (!dbItem.isAvailable) {
        throw new AppError(`Item ${dbItem.name} is currently out of stock.`, 400);
      }

      // Calculate base price + selected modifiers additional prices
      let itemUnitPrice = dbItem.price;
      const selectedMods = item.selectedModifiers || [];

      selectedMods.forEach(mod => {
        itemUnitPrice += mod.price || 0;
      });

      const quantity = Number(item.quantity) || 1;
      const subTotal = itemUnitPrice * quantity;
      calculatedTotal += subTotal;

      processedItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: itemUnitPrice,
        quantity,
        selectedModifiers: selectedMods
      });
    }

    // 3) Create Order and OrderItems in a transaction
    return await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          restaurantId,
          table,
          totalAmount: parseFloat(calculatedTotal.toFixed(2)),
          notes,
          status: 'PENDING'
        }
      });

      // Create OrderItem entries
      const orderItemPromises = processedItems.map(pItem => {
        return tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: pItem.menuItemId,
            name: pItem.name,
            price: pItem.price,
            quantity: pItem.quantity,
            selectedModifiers: pItem.selectedModifiers
          }
        });
      });

      await Promise.all(orderItemPromises);

      // Return order with items
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true }
      });
    });
  }

  async getRestaurantOrders(restaurantId, ownerId) {
    await this.checkOwnership(restaurantId, ownerId);

    return await prisma.order.findMany({
      where: { restaurantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrderById(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async updateOrderStatus(orderId, ownerId, status) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    await this.checkOwnership(order.restaurantId, ownerId);

    const validStatuses = ['PENDING', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'];
    const uppercaseStatus = status.toUpperCase();

    if (!validStatuses.includes(uppercaseStatus)) {
      throw new AppError('Invalid order status', 400);
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: uppercaseStatus },
      include: { items: true }
    });
  }
}

module.exports = new OrderService();
