const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class MenuService {
  // Check if restaurant is owned by this user
  async checkOwnership(restaurantId, ownerId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    if (restaurant.ownerId !== ownerId) {
      throw new AppError('You do not own this restaurant', 403);
    }
    return restaurant;
  }

  // ==========================================
  // SECTION OPERATIONS (CATEGORIES)
  // ==========================================

  async createSection(restaurantId, ownerId, name, description, sortOrder = 0) {
    await this.checkOwnership(restaurantId, ownerId);

    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    return await prisma.menuSection.create({
      data: {
        restaurantId,
        name,
        description,
        sortOrder: Number(sortOrder)
      }
    });
  }

  async updateSection(sectionId, ownerId, updateData) {
    const section = await prisma.menuSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      throw new AppError('Menu section not found', 404);
    }

    await this.checkOwnership(section.restaurantId, ownerId);

    return await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        name: updateData.name,
        description: updateData.description,
        sortOrder: updateData.sortOrder !== undefined ? Number(updateData.sortOrder) : undefined
      }
    });
  }

  async deleteSection(sectionId, ownerId) {
    const section = await prisma.menuSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      throw new AppError('Menu section not found', 404);
    }

    await this.checkOwnership(section.restaurantId, ownerId);

    return await prisma.menuSection.delete({
      where: { id: sectionId }
    });
  }

  // ==========================================
  // ITEM OPERATIONS
  // ==========================================

  async createMenuItem(restaurantId, ownerId, data) {
    await this.checkOwnership(restaurantId, ownerId);

    // Verify section belongs to restaurant
    const section = await prisma.menuSection.findUnique({
      where: { id: data.sectionId }
    });

    if (!section || section.restaurantId !== restaurantId) {
      throw new AppError('Invalid menu section for this restaurant', 400);
    }

    if (!data.name || data.price === undefined) {
      throw new AppError('Item name and price are required', 400);
    }

    return await prisma.menuItem.create({
      data: {
        restaurantId,
        sectionId: data.sectionId,
        name: data.name,
        description: data.description,
        price: Float(data.price),
        imageUrl: data.imageUrl,
        isVeg: data.isVeg !== undefined ? Boolean(data.isVeg) : true,
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
        tags: data.tags || [],
        modifiers: data.modifiers || null
      }
    });
  }

  async updateMenuItem(itemId, ownerId, data) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new AppError('Menu item not found', 404);
    }

    await this.checkOwnership(item.restaurantId, ownerId);

    if (data.sectionId) {
      const section = await prisma.menuSection.findUnique({
        where: { id: data.sectionId }
      });
      if (!section || section.restaurantId !== item.restaurantId) {
        throw new AppError('Invalid menu section for this restaurant', 400);
      }
    }

    return await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        sectionId: data.sectionId,
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? Float(data.price) : undefined,
        imageUrl: data.imageUrl,
        isVeg: data.isVeg !== undefined ? Boolean(data.isVeg) : undefined,
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : undefined,
        tags: data.tags,
        modifiers: data.modifiers !== undefined ? data.modifiers : undefined
      }
    });
  }

  async deleteMenuItem(itemId, ownerId) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new AppError('Menu item not found', 404);
    }

    await this.checkOwnership(item.restaurantId, ownerId);

    return await prisma.menuItem.delete({
      where: { id: itemId }
    });
  }
}

// Float helper as JS does not have Float but prisma mapping demands it
function Float(val) {
  return parseFloat(val);
}

module.exports = new MenuService();
