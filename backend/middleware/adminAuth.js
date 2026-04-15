const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, admin authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // In our unified system, we use userId and check the role from DB
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

module.exports = adminAuth;
