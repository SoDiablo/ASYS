const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const {
  getAllCommonAreas,
  getActiveCommonAreas,
  createCommonArea,
  updateCommonArea,
  deleteCommonArea
} = require('../controllers/commonAreasController');

// Get all common areas (Admin)
router.get('/', authenticateToken, authorizeRole('admin'), getAllCommonAreas);

// Get active common areas (All authenticated users)
router.get('/active', authenticateToken, getActiveCommonAreas);

// Create common area (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), createCommonArea);

// Update common area (Admin only)
router.put('/:areaId', authenticateToken, authorizeRole('admin'), updateCommonArea);
router.patch('/:areaId', authenticateToken, authorizeRole('admin'), updateCommonArea);

// Delete common area (Admin only)
router.delete('/:areaId', authenticateToken, authorizeRole('admin'), deleteCommonArea);

module.exports = router;
