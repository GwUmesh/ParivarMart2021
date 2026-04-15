require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Settings = require('./models/Settings');
const Category = require('./models/Category');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Parivar Mart API is working! 🛒', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/promocodes', require('./routes/promocodes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Seed initial data
const seedData = async () => {
  try {
    // Create default admin if not exists in User collection
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Parivar Mart Admin',
        email: process.env.ADMIN_EMAIL || 'admin@parivarmart.com',
        password: process.env.ADMIN_PASSWORD || 'admin123456',
        role: 'admin'
      });
      console.log('✅ Default admin user created in User collection');
    }

    // Create default settings if not exists
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({});
      console.log('✅ Default settings created');
    }

    // Create default categories if none exist
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCategories = [
        { name: 'Oils', slug: 'oils', description: 'Cooking oils and ghee' },
        { name: 'Biscuits', slug: 'biscuits', description: 'Biscuits and cookies' },
        { name: 'Detergents', slug: 'detergents', description: 'Cleaning and laundry products' },
        { name: 'Snacks', slug: 'snacks', description: 'Chips, namkeen and snacks' },
        { name: 'Beverages', slug: 'beverages', description: 'Drinks, juices and soft drinks' },
        { name: 'Household Items', slug: 'household-items', description: 'Daily household essentials' },
      ];
      await Category.insertMany(defaultCategories);
      console.log('✅ Default categories created');
    }
  } catch (error) {
    console.error('Seed data error:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`\n🛒 Parivar Mart Backend Server`);
    console.log(`📡 Running on: http://localhost:${PORT}`);
    console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
    console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();
