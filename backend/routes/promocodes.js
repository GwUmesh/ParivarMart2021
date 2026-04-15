const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// POST apply promocode (user)
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) return res.status(400).json({ message: 'Please enter a promo code' });

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    if (new Date() > promo.expiryDate) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    if (promo.minOrder > 0 && subtotal < promo.minOrder) {
      return res.status(400).json({
        message: `Minimum order of ₹${promo.minOrder} required for this promo code`,
      });
    }

    let discount = 0;
    if (promo.discountType === 'flat') {
      discount = promo.value;
    } else {
      discount = (subtotal * promo.value) / 100;
      if (promo.maxDiscount > 0) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    }

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      value: promo.value,
      discount: Math.round(discount * 100) / 100,
      message: `Promo applied! You save ₹${discount.toFixed(2)}`,
    });
  } catch (error) {
    console.error('Apply promo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create promocode (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { code, discountType, value, minOrder, maxDiscount, expiryDate, usageLimit } = req.body;

    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Promo code already exists' });

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      value,
      minOrder: minOrder || 0,
      maxDiscount: maxDiscount || 0,
      expiryDate,
      usageLimit: usageLimit || 0,
    });

    res.status(201).json(promo);
  } catch (error) {
    console.error('Create promo error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET all promocodes (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update promocode (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!promo) return res.status(404).json({ message: 'Promo code not found' });
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE promocode (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo code not found' });
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
