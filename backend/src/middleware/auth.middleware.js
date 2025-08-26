import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { error as _error, debug } from '../utils/logger.js';
import asyncHandler from 'express-async-handler';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};


const generateAccessToken = user => jwt.sign({
  id: user._id,
  role: user.role
}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateRefreshToken = user => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
  const expiresAt = new Date(Date.now() + parseDuration(process.env.JWT_REFRESH_EXPIRE));
  user.refreshToken = { token, expiresAt };
  user.save({ validateBeforeSave: false });
  return token;
};

// Protect middleware - authenticate user
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token missing' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password -refreshToken.token');
    next();
  } catch (err) {const message =
      err.name === 'TokenExpiredError'
        ? 'Access token expired'
        : 'Not authorized, token invalid';
    return res.status(401).json({ success: false, message });
  }
});

/**
 * Convert duration string to milliseconds
 * Examples:
 *   "30d" -> 2592000000
 *   "7d"  -> 604800000
 *   "12h" -> 43200000
 *   "15m" -> 900000
 *   "45s" -> 45000
 */
function parseDuration(duration) {
  if (typeof duration !== "string") {
    throw new Error("Duration must be a string, e.g., '30d', '12h', '15m', '45s'");
  }

  const regex = /^(\d+)([dhms])$/i;
  const match = duration.match(regex);

  if (!match) {
    throw new Error("Invalid duration format. Use number + unit (d/h/m/s)");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    d: 24 * 60 * 60 * 1000, // days
    h: 60 * 60 * 1000,      // hours
    m: 60 * 1000,           // minutes
    s: 1000,                // seconds
  };

  return value * multipliers[unit];
}


// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.error('Not authorized', 401, 'NOT_AUTHORIZED')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error(
          `User role '${req.user.role}' is not authorized to access this route`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

// Optional auth middleware - doesn't require authentication but adds user if present
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -refreshToken');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
        debug('Optional auth token error:', error.message);
      }
    }

    next();
  } catch (error) {
    _error('Optional auth middleware error:', error);
    next();
  }
};

// Admin only middleware
const adminOnly = authorize('admin');

// Operator or Admin middleware
const operatorOrAdmin = authorize('operator', 'admin');

// Same user or Admin middleware
const sameUserOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.userId) {
    return next();
  }

  return res.status(403).json(
    ApiResponse.error('Not authorized to access this resource', 403, 'ACCESS_DENIED')
  );
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would typically use Redis to track attempts
  // For now, just pass through
  next();
};

// Verify phone ownership
const verifyPhoneOwnership = async (req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (req.user && req.user.phone !== phone) {
      return res.status(403).json(
        ApiResponse.error('Phone number does not match authenticated user', 403, 'PHONE_MISMATCH')
      );
    }
    
    next();
  } catch (error) {
    _error('Phone verification error:', error);
    return res.status(500).json(
      ApiResponse.error('Server error in phone verification', 500)
    );
  }
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json(
      ApiResponse.error('Phone number verification required', 403, 'VERIFICATION_REQUIRED')
    );
  }
  next();
};

// API key validation (for external services)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json(
      ApiResponse.error('API key required', 401, 'API_KEY_MISSING')
    );
  }

  // In production, validate against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json(
      ApiResponse.error('Invalid API key', 401, 'INVALID_API_KEY')
    );
  }

  next();
};

// Booking ownership verification
const verifyBookingOwnership = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const Booking = require('../models/booking.model.js');
    
    const booking = await Booking.findOne({ 
      bookingId,
      'user.userId': req.user._id 
    });
    
    if (!booking && req.user.role !== 'admin') {
      return res.status(404).json(
        ApiResponse.error('Booking not found or access denied', 404, 'BOOKING_NOT_FOUND')
      );
    }
    
    req.booking = booking;
    next();
  } catch (error) {
    _error('Booking ownership verification error:', error);
    return res.status(500).json(
      ApiResponse.error('Server error in booking verification', 500)
    );
  }
};

// Route ownership verification (for operators)
const verifyRouteOwnership = async (req, res, next) => {
  try {
    const { routeId } = req.params;
    const Route = require('../models/circuit.model.js');
    
    const route = await Route.findById(routeId);
    
    if (!route) {
      return res.status(404).json(
        ApiResponse.error('Route not found', 404, 'ROUTE_NOT_FOUND')
      );
    }
    
    // Admin can access any route, operator can only access their own routes
    if (req.user.role === 'admin' || route.operator.operatorId.toString() === req.user._id.toString()) {
      req.route = route;
      return next();
    }
    
    return res.status(403).json(
      ApiResponse.error('Not authorized to access this route', 403, 'ROUTE_ACCESS_DENIED')
    );
  } catch (error) {
    _error('Route ownership verification error:', error);
    return res.status(500).json(
      ApiResponse.error('Server error in route verification', 500)
    );
  }
};

export default {
  generateToken,
  generateRefreshToken,
  protect,
  authorize,
  optionalAuth,
  adminOnly,
  operatorOrAdmin,
  sameUserOrAdmin,
  sensitiveOperationLimit,
  verifyPhoneOwnership,
  requireVerification,
  validateApiKey,
  verifyBookingOwnership,
  verifyRouteOwnership,
  generateAccessToken
};