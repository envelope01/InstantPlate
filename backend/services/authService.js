const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const AppError = require('../utils/appError');

class AuthService {
  generateToken(id) {
    return jwt.sign(
      { id }, 
      process.env.JWT_SECRET || 'instantplate_super_secret_jwt_key_12345', 
      { expiresIn: '30d' }
    );
  }

  async signup(email, password, role = 'OWNER') {
    // 1) Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 2) Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    // 3) Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4) Create user and auto-create a default Restaurant
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role.toUpperCase()
        }
      });

      // Auto-create a default restaurant for owners
      if (newUser.role === 'OWNER') {
        const defaultName = `My Restaurant`;
        const slug = `restaurant-${newUser.id.substring(0, 8)}`;
        await tx.restaurant.create({
          data: {
            ownerId: newUser.id,
            name: defaultName,
            slug,
            description: 'Welcome to our restaurant! Browse our delicious menu and order directly from your table.',
            themeColor: '#8B5CF6',
            tables: ['Table 1', 'Table 2', 'Table 3', 'Table 4']
          }
        });
      }

      return newUser;
    });

    const token = this.generateToken(user.id);
    
    // Remove password from output
    user.password = undefined;

    return { user, token };
  }

  async login(email, password) {
    // 1) Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 2) Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { restaurants: true }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3) Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id);
    
    user.password = undefined;

    return { user, token };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { restaurants: true }
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    user.password = undefined;
    return user;
  }
}

module.exports = new AuthService();
