import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json(ApiResponse.success(req.user, 'User profile retrieved successfully'));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to retrieve user profile'));
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, email, address, emergencyContact } = req.body;
    
    const user = req.user;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (address) user.address = address;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    
    await user.save();
    
    res.json(ApiResponse.success(user, 'Profile updated successfully'));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to update profile'));
  }
});

export default router; 