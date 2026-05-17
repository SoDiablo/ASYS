const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users (Manager only)
router.get('/', authorizeRole('admin'), userController.getAllUsers);

// Create user (Manager only)
router.post('/', authorizeRole('admin'), userController.createUser);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Update user profile
router.patch('/:userId', userController.updateUser);

// Reset user password (Admin only)
router.post('/:userId/reset-password', authorizeRole('admin'), userController.resetUserPassword);

// Delete user (Admin only)
router.delete('/:userId', authorizeRole('admin'), userController.deleteUser);

module.exports = router;
