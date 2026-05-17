const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get payment settings (all authenticated users can view)
router.get('/payment', settingsController.getPaymentSettings);

// Update payment settings (admin only)
router.put('/payment', authorizeRole('admin'), settingsController.updatePaymentSettings);

// Update monthly expected total only (admin only)
router.patch('/monthly-expected', authorizeRole('admin'), settingsController.updateMonthlyExpected);

module.exports = router;
