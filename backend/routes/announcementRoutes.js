const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all announcements (All users)
router.get('/', announcementController.getAnnouncements);

// Create announcement (Manager only)
router.post('/', authorizeRole('admin'), announcementController.createAnnouncement);

// Update announcement (Manager only)
router.patch('/:announcementId', 
  authorizeRole('admin'), 
  announcementController.updateAnnouncement
);

// Delete announcement (Manager only)
router.delete('/:announcementId', 
  authorizeRole('admin'), 
  announcementController.deleteAnnouncement
);

module.exports = router;
