const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class RestaurantService {
  async getRestaurantBySlugOrId(slugOrId) {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { id: slugOrId },
          { slug: slugOrId }
        ]
      },
      include: {
        menuSections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isAvailable: true }
            }
          }
        }
      }
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  async getRestaurantByOwner(ownerId) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId }
    });
    if (!restaurant) {
      throw new AppError('No restaurant found for this owner', 404);
    }
    return restaurant;
  }

  async updateRestaurant(restaurantId, ownerId, updateData) {
    // 1) Verify ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError('You are not authorized to update this restaurant', 403);
    }

    // 2) Generate new slug if name is updated
    let data = { ...updateData };
    if (updateData.name && updateData.name !== restaurant.name) {
      data.slug = `${updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${restaurantId.substring(0, 5)}`;
    }

    // 3) Update
    return await prisma.restaurant.update({
      where: { id: restaurantId },
      data
    });
  }

  async addTable(restaurantId, ownerId, tableName) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError('Unauthorized', 403);
    }

    if (!tableName || tableName.trim() === '') {
      throw new AppError('Table name cannot be empty', 400);
    }

    if (restaurant.tables.includes(tableName)) {
      throw new AppError('Table name already exists', 400);
    }

    return await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        tables: {
          set: [...restaurant.tables, tableName.trim()]
        }
      }
    });
  }

  async removeTable(restaurantId, ownerId, tableName) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new AppError('Unauthorized', 403);
    }

    if (!restaurant.tables.includes(tableName)) {
      throw new AppError('Table not found', 404);
    }

    return await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        tables: {
          set: restaurant.tables.filter(t => t !== tableName)
        }
      }
    });
  }
}

module.exports = new RestaurantService();
