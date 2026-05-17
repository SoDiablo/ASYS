const express = require('express');
const router = express.Router();
const duesController = require('../controllers/duesController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get dues for an apartment
router.get('/apartment/:apartmentId', duesController.getDuesByApartment);

// Pay dues
router.post('/:dueId/pay', duesController.payDues);

// Get payment history
router.get('/apartment/:apartmentId/payments', duesController.getPaymentHistory);

// Manager only routes
router.get('/all', authorizeRole('admin'), duesController.getAllDues);
router.post('/', authorizeRole('admin'), duesController.createDues);
router.patch('/:dueId/status', authorizeRole('admin'), duesController.updateDueStatus);

module.exports = router;
