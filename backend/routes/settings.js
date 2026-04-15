const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const adminAuth = require('../middleware/adminAuth');

// GET settings (public — needed for pricing display)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update settings (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
