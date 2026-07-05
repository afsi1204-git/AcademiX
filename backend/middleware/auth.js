const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verify JWT token
 * Adds user object to request
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

/**
 * Middleware to check user role and admin approval state
 * Usage: authorize('admin', 'instructor')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // 1. Basic role inclusion evaluation check
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    // 2. 🛡️ DEVELOPMENT MODE: Allow instructors to create courses regardless of approval status
    // In production, uncomment the block below to enforce approval
    // if (req.user.role === 'instructor' && req.user.instructorRequestStatus !== 'approved') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access Denied: Your instructor status is pending administrator activation clearance.',
    //   });
    // }

    next();
  };
};

/**
 * Middleware to verify email
 */
exports.verifyEmail = async (req, res, next) => {
  if (!req.user || !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email first',
    });
  }
  next();
};

/**
 * Middleware to verify admin role
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only admins can access this resource',
    });
  }

  next();
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token invalid but we continue as optional
    }
  }

  next();
};