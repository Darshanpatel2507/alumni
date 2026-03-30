const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT from Authorization header.
 * Attaches req.user (without password) on success.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

/**
 * adminOnly — must be called after protect.
 * Blocks non-admin users.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: admins only' });
};

/**
 * approvedOnly — blocks unapproved alumni from accessing protected content.
 */
const approvedOnly = (req, res, next) => {
  if (req.user.role === 'alumni' && !req.user.isApproved) {
    return res.status(403).json({
      message: 'Your alumni account is pending admin approval.',
    });
  }
  next();
};

module.exports = { protect, adminOnly, approvedOnly };
