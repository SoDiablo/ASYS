const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Create maintenance request (Resident)
router.post('/requests', maintenanceController.createRequest);

// Get maintenance requests (filtered by role)
router.get('/requests', maintenanceController.getRequests);

// Get all maintenance requests (Manager only)
router.get('/all', authorizeRole('admin'), maintenanceController.getAllRequests);

// Update request status (Manager only)
router.patch('/requests/:requestId/status', 
  authorizeRole('admin'), 
  maintenanceController.updateRequestStatus
);

// Rate completed request (Resident)
router.post('/requests/:requestId/rating', maintenanceController.rateRequest);

module.exports = router;
