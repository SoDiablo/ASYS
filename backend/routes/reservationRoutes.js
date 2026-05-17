const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get common areas
router.get('/common-areas', reservationController.getCommonAreas);

// Get common areas (alias for compatibility)
router.get('/areas', reservationController.getCommonAreas);

// Get availability for a common area
router.get('/availability', reservationController.getAvailability);

// Create reservation
router.post('/', reservationController.createReservation);

// Get user's reservations
router.get('/user', reservationController.getUserReservations);

// Get all reservations (Manager only)
router.get('/all', authorizeRole('admin'), reservationController.getAllReservations);

// Update reservation (Admin only)
router.put('/:reservationId', authorizeRole('admin'), reservationController.updateReservation);

// Cancel reservation
router.put('/:reservationId/cancel', reservationController.cancelReservation);

// Delete reservation (alias)
router.delete('/:reservationId', reservationController.cancelReservation);

module.exports = router;
