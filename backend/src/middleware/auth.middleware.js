import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { error as _error, debug } from '../utils/logger.js';

// Generate JWT Token
const generateToken = (payload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate Refresh Token
const generateRefreshToken = (payload) => {
  return sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// Protect middleware - authenticate user
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json(
        ApiResponse.error('Not authorized to access this route', 401, 'NO_TOKEN')
      );
    }

    try {
      // Verify token
      const decoded = verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!user) {
        return res.status(401).json(
          ApiResponse.error('User not found', 401, 'USER_NOT_FOUND')
        );
      }

      if (!user.isActive) {
        return res.status(401).json(
          ApiResponse.error('User account is deactivated', 401, 'ACCOUNT_DEACTIVATED')
        );
      }

      req.user = user;
      next();
    } catch (error) {
      _error('JWT verification failed:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(
          ApiResponse.error('Token expired', 401, 'TOKEN_EXPIRED')
        );
      }
      
      return res.status(401).json(
        ApiResponse.error('Invalid token', 401, 'INVALID_TOKEN')
      );
    }
  } catch (error) {
    _error('Auth middleware error:', error);
    return res.status(500).json(
      ApiResponse.error('Server error in authentication', 500, 'AUTH_ERROR')
    );
  }
};

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
    const Booking = require('../models/Booking');
    
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
    const Route = require('../models/Route');
    
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
  verifyRouteOwnership
};