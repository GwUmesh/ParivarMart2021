const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const PromoCode = require('../models/PromoCode');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { generateInvoiceNumber, generateInvoiceHTML } = require('../utils/invoice');
const { sendEmail } = require('../config/email');

// POST create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, address, promoCode, paymentMethod, deliveryType } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Get settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images[0] || '',
      });
    }

    // Check minimum order
    if (subtotal < settings.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value is ₹${settings.minOrderValue}. Current subtotal: ₹${subtotal}`,
      });
    }

    // Calculate delivery and platform fee
    let deliveryCharge = 0;
    let platformFee = 0;

    if (deliveryType !== 'store_pickup') {
      if (subtotal < settings.freeDeliveryThreshold) {
        deliveryCharge = settings.deliveryCharge;
        platformFee = settings.platformFee;
      }
      // else FREE delivery + FREE platform fee
    }

    // Apply promocode
    let discount = 0;
    let appliedPromoCode = '';

    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (promo) {
        if (promo.minOrder > 0 && subtotal < promo.minOrder) {
          return res.status(400).json({
            message: `Promo code requires minimum order of ₹${promo.minOrder}`,
          });
        }

        if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
          return res.status(400).json({ message: 'Promo code usage limit reached' });
        }

        if (promo.discountType === 'flat') {
          discount = promo.value;
        } else {
          discount = (subtotal * promo.value) / 100;
          if (promo.maxDiscount > 0) {
            discount = Math.min(discount, promo.maxDiscount);
          }
        }

        appliedPromoCode = promo.code;
        promo.usedCount += 1;
        await promo.save();
      }
    }

    const total = subtotal + deliveryCharge + platformFee - discount;
    const invoiceNumber = await generateInvoiceNumber();

    // Create order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      address: address || {},
      subtotal,
      deliveryCharge,
      platformFee,
      discount,
      promoCode: appliedPromoCode,
      total: Math.max(total, 0),
      totalAmount: Math.max(total, 0),
      invoiceNumber,
      paymentMethod: paymentMethod || 'cod',
      deliveryType: deliveryType || 'home_delivery',
    });

    // Decrease stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send invoice email
    const user = await User.findById(req.userId);
    if (user && user.email) {
      const emailHTML = generateInvoiceHTML(order);
      await sendEmail({
        to: user.email,
        subject: `Order Confirmed - ${order.invoiceNumber} | Parivar Mart`,
        html: emailHTML,
      });
    }

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images slug');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all orders (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single order (admin)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});// GET order invoice (admin or owner)
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug');
    
    if (!order) return res.status(404).send('Order not found');

    // Allow if user is admin OR the one who placed the order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.userId) {
      return res.status(403).send('Not authorized to view this invoice');
    }

    const invoiceHTML = generateInvoiceHTML(order);
    res.send(invoiceHTML);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


// PUT update order status (admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send status update email
    if (order.user && order.user.email) {
      await sendEmail({
        to: order.user.email,
        subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - ${order.invoiceNumber} | Parivar Mart`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #015958;">Order Status Update</h2>
            <p>Hi ${order.user.name},</p>
            <p>Your order <strong>${order.invoiceNumber}</strong> status has been updated to:</p>
            <div style="background: #0FC2C0; color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">
              ${status.replace(/_/g, ' ').toUpperCase()}
            </div>
            <p style="margin-top: 20px;">Thank you for shopping at Parivar Mart! 🙏</p>
          </div>
        `,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
