const pool = require('../config/database');

// FR-21: Create announcement (Manager only)
async function createAnnouncement(req, res) {
  try {
    const { title, content, priority, target_audience } = req.body;
    const adminId = req.user.user_id;
    
    if (!title || !content) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'title and content are required'
        }
      });
    }
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid priority. Must be low, medium, or high'
        }
      });
    }
    
    // Validate target_audience
    const validTargets = ['all', 'residents', 'admin', 'security'];
    if (target_audience && !validTargets.includes(target_audience)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid target_audience. Must be all, residents, admin, or security'
        }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO announcements (admin_id, title, content, priority, target_audience)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [adminId, title, content, priority || 'medium', target_audience || 'all']
    );
    
    // TODO: FR-22 - Send notifications to targeted users
    console.log('New announcement published:', result.rows[0].announcement_id);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Announcement created successfully'
    });
    
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating announcement'
      }
    });
  }
}

// FR-23: Get all announcements
async function getAnnouncements(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT a.*, u.name as admin_name
       FROM announcements a
       JOIN users u ON a.admin_id = u.user_id
       WHERE a.is_active = true
       ORDER BY a.published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.json({ announcements: result.rows });
    
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching announcements'
      }
    });
  }
}

// FR-24: Update announcement (Manager only)
async function updateAnnouncement(req, res) {
  try {
    const { announcementId } = req.params;
    const { title, content } = req.body;
    
    if (!title && !content) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'At least one field (title or content) is required'
        }
      });
    }
    
    let query = 'UPDATE announcements SET ';
    const params = [];
    const updates = [];
    let paramCount = 0;
    
    if (title) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      params.push(title);
    }
    
    if (content) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      params.push(content);
    }
    
    paramCount++;
    query += updates.join(', ') + ` WHERE announcement_id = $${paramCount} RETURNING *`;
    params.push(announcementId);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Announcement not found'
        }
      });
    }
    
    res.json({
      announcement_id: result.rows[0].announcement_id,
      updated_at: new Date()
    });
    
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating announcement'
      }
    });
  }
}

// FR-24: Delete announcement (Manager only) - soft delete
async function deleteAnnouncement(req, res) {
  try {
    const { announcementId } = req.params;
    
    const result = await pool.query(
      'UPDATE announcements SET is_active = false WHERE announcement_id = $1 RETURNING *',
      [announcementId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Announcement not found'
        }
      });
    }
    
    res.json({ message: 'Announcement deleted successfully' });
    
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting announcement'
      }
    });
  }
}

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
};
