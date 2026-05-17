const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (Manager only)
router.patch('/activate-user/:userId', 
  authenticateToken, 
  authorizeRole('admin'), 
  authController.activateUser
);

module.exports = router;
