const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');

// Multer config for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20, active } = req.query;
    const query = {};

    if (active !== 'all') {
      query.isActive = true;
    }
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Resolve slug to ID
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        } else {
          // If category slug not found, return empty results early
          return res.json({ products: [], total: 0, page: 1, pages: 0 });
        }
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single product by slug or ID (public)
router.get('/:slug', async (req, res) => {
  try {
    let product;
    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      product = await Product.findById(req.params.slug).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    }
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create product (admin)
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, slug, description, price, discountPrice, category, stock, unit, isActive } = req.body;

    const existing = await Product.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Product with this slug already exists' });

    // Handle images: combine uploaded files and body-provided URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/products/${f.filename}`);
    }
    
    // Merge with URLs from body if provided
    if (req.body.images) {
      const bodyImages = Array.isArray(req.body.images) 
        ? req.body.images 
        : [req.body.images];
      images = [...images, ...bodyImages.filter(img => img && img.trim() !== '')];
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: parseFloat(price),
      discountPrice: parseFloat(discountPrice) || 0,
      images,
      category,
      stock: parseInt(stock) || 0,
      unit: unit || 'piece',
      isActive: isActive !== 'false',
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PUT update product (admin)
router.put('/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, slug, description, price, discountPrice, category, stock, unit, isActive, existingImages } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Handle images
    let images = [];
    
    // 1. Start with existing images if provided (either as JSON string or array)
    if (existingImages) {
      try {
        images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (e) {
        images = Array.isArray(existingImages) ? existingImages : [existingImages];
      }
    } else if (req.body.images) {
      // Fallback to 'images' field if 'existingImages' isn't used
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      // Keep existing product images if nothing new is provided
      images = product.images;
    }

    // 2. Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
      images = [...images, ...newImages];
    }

    // 3. Filter out empty strings
    images = images.filter(img => img && img.trim() !== '');

    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.description = description !== undefined ? description : product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.discountPrice = discountPrice !== undefined ? parseFloat(discountPrice) : product.discountPrice;
    product.category = category || product.category;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.unit = unit || product.unit;
    product.isActive = isActive !== undefined ? isActive !== 'false' : product.isActive;
    product.images = images;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE product (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
