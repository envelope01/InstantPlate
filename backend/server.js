require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma/client');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const globalErrorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

const app = express();
const port = process.env.PORT || 5000;

// ===========================
// Global Middlewares
// ===========================
app.use(cors());
app.use(express.json());

// ===========================
// Verify DB Connection
// ===========================
async function checkDbConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL via Prisma! 🚀');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  }
}
checkDbConnection();

// ===========================
// Routes Mounting
// ===========================
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', serviceRequestRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "InstantPlate SaaS API is connected and running!" });
});

// ===========================
// Unhandled Routes Fallback
// ===========================
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ===========================
// Global Error Handler
// ===========================
app.use(globalErrorHandler);

// ===========================
// Start server
// ===========================
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
