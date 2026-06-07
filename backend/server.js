// Import required modules
const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
const authRouter = require('./routes/auth');

const User = require('./models/user');
const Restaurant = require('./models/restaurant')

const bcrypt = require('bcryptjs');

const app = express();

app.use('/api', authRouter);

const port = 5000;

// Middleware
app.use(express.json()); 
app.use(cors()); 

// Connect to MongoDB
connectToMongo();

// ===========================
// Signup Route
// ===========================
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user and save to the database
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Send success response
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// Login Route
// ===========================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Send success response
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// Add Restaurant Route
// ===========================
app.post('/api/addRestaurant', async (req, res) => {
  try {
    const { name, category, location } = req.body;

    // Create a unique compound index on name and location fields
    await Restaurant.init().then(() => {
      Restaurant.collection.createIndex({ name: 1, location: 1 }, { unique: true });
    });

    // Check if a document with the same name and location already exists
    const existingRestaurant = await Restaurant.findOne({ name, location });

    if (existingRestaurant) {
      // If a document exists, check if the category is different
      if (existingRestaurant.category === category) {
        throw new Error('Category must be different for the same name and location');
      } else {
        // If the category is different, update the existing document
        existingRestaurant.category = category;
        await existingRestaurant.save();
        res.status(200).json({ message: 'Restaurant updated successfully', restaurant: existingRestaurant });
        return;
      }
    }

    // Check if a document with the same category already exists
    const existingCategoryRestaurant = await Restaurant.findOne({ category });

    if (existingCategoryRestaurant) {
      // If a document with the same category exists, check if the name and location are different
      if (existingCategoryRestaurant.name === name && existingCategoryRestaurant.location === location) {
        throw new Error('Name and location must be different for the same category');
      }
    }

    // Create a new restaurant and save to the database
    const newRestaurant = new Restaurant({ name, category, location });
    await newRestaurant.save();

    // Send success response
    res.status(201).json({ message: 'Restaurant added successfully', restaurant: newRestaurant });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is connected!" });
});

// Fallback route for unmatched endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
