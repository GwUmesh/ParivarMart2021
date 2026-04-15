const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// POST create review
router.post('/', auth, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Check for existing review
    const existing = await Review.findOne({ user: req.userId, product });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.userId,
      product,
      rating,
      comment,
    });

    const populated = await Review.findById(review._id).populate('user', 'name profilePic');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;

    res.json({ reviews, total, avgRating: parseFloat(avgRating) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all reviews (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { approved } = req.query;
    const query = {};
    if (approved === 'true') query.isApproved = true;
    if (approved === 'false') query.isApproved = false;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT approve/reject review (admin)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user', 'name email').populate('product', 'name');

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE review (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
