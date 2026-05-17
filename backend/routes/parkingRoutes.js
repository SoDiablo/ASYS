const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all parking spots
router.get('/spots', parkingController.getParkingSpots);

// Create parking spot (Admin only)
router.post('/spots', authorizeRole('admin'), parkingController.createParkingSpot);

// Update parking spot (Admin and Resident can claim/release)
router.put('/spots/:spotId', authorizeRole('admin', 'resident'), parkingController.updateParkingSpot);

// Delete parking spot (Admin only)
router.delete('/spots/:spotId', authorizeRole('admin'), parkingController.deleteParkingSpot);

// Assign parking spot (Manager only)
router.patch('/spots/:spotId/assign', 
  authorizeRole('admin'), 
  parkingController.assignParkingSpot
);

// Register visitor vehicle (Security only)
router.post('/visitors', 
  authorizeRole('security', 'admin'), 
  parkingController.registerVisitor
);

// Record visitor exit (Security only)
router.patch('/visitors/:visitId/exit', 
  authorizeRole('security', 'admin'), 
  parkingController.recordVisitorExit
);

// Get overstay alerts (Security only)
router.get('/visitors/overstay', 
  authorizeRole('security', 'admin'), 
  parkingController.getOverstayAlerts
);

module.exports = router;
