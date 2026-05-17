const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication and Manager role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Get dashboard data
router.get('/dashboard', reportController.getDashboard);

// Generate dues collection PDF report
router.get('/dues-collection/pdf', reportController.generateDuesReport);

module.exports = router;
