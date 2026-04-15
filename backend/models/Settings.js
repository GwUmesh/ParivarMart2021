const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  minOrderValue: {
    type: Number,
    default: 100,
  },
  deliveryCharge: {
    type: Number,
    default: 40,
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 1000,
  },
  platformFee: {
    type: Number,
    default: 3,
  },
  storeName: {
    type: String,
    default: 'Parivar Mart',
  },
  storePhone: {
    type: String,
    default: '+91 7021716914',
  },
  storeEmail: {
    type: String,
    default: 'parivarmart399@gmail.com',
  },
  storeAddress: {
    type: String,
    default: 'Parade Corner, Rasayani, Raigad – 410220, Maharashtra, India',
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
