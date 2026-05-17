const pool = require('../config/database');

// FR-15, BR-05: Create maintenance request
async function createRequest(req, res) {
  try {
    let { apartment_id, category, priority, description, photo_url } = req.body;
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // If resident and no apartment_id provided, get it from their user record
    if (userRole === 'resident' && !apartment_id) {
      const apartmentResult = await pool.query(
        'SELECT apartment_id FROM apartments WHERE user_id = $1',
        [userId]
      );
      
      if (apartmentResult.rows.length === 0) {
        return res.status(400).json({
          error: {
            code: 'CONSTRAINT_VIOLATION',
            message: 'User is not assigned to an apartment'
          }
        });
      }
      
      apartment_id = apartmentResult.rows[0].apartment_id;
    }
    
    // Validate required fields
    if (!apartment_id || !category || !priority || !description) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'apartment_id, category, priority, and description are required'
        }
      });
    }
    
    // Validate category
    const validCategories = ['electric', 'water', 'elevator', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid category'
        }
      });
    }
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid priority'
        }
      });
    }
    
    // BR-05: Check open request limit (max 3)
    const openRequestsResult = await pool.query(
      `SELECT COUNT(*) FROM maintenance_requests 
       WHERE user_id = $1 AND status IN ('pending', 'in_progress')`,
      [userId]
    );
    
    const openCount = parseInt(openRequestsResult.rows[0].count);
    if (openCount >= 3) {
      return res.status(422).json({
        error: {
          code: 'MAX_REQUESTS_EXCEEDED',
          message: 'You have reached the maximum of 3 open maintenance requests'
        }
      });
    }
    
    // Create request
    const result = await pool.query(
      `INSERT INTO maintenance_requests 
       (apartment_id, user_id, category, priority, description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [apartment_id, userId, category, priority, description, photo_url || null]
    );
    
    // TODO: FR-16 - Send notification to Manager
    console.log('New maintenance request created:', result.rows[0].request_id);
    
    res.status(201).json({
      request_id: result.rows[0].request_id,
      status: result.rows[0].status,
      created_at: result.rows[0].created_at
    });
    
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the request'
      }
    });
  }
}

// FR-20: Get maintenance requests with filters
async function getRequests(req, res) {
  try {
    const { apartment_id, status, category, startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userId = req.user.user_id;
    
    let query = `
      SELECT mr.*, a.block, a.floor, a.number, u.name as requester_name
      FROM maintenance_requests mr
      JOIN apartments a ON mr.apartment_id = a.apartment_id
      JOIN users u ON mr.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    // Residents can only see their own requests
    if (userRole === 'resident') {
      paramCount++;
      query += ` AND mr.user_id = $${paramCount}`;
      params.push(userId);
    }
    
    if (apartment_id) {
      paramCount++;
      query += ` AND mr.apartment_id = $${paramCount}`;
      params.push(apartment_id);
    }
    
    if (status) {
      paramCount++;
      query += ` AND mr.status = $${paramCount}`;
      params.push(status);
    }
    
    if (category) {
      paramCount++;
      query += ` AND mr.category = $${paramCount}`;
      params.push(category);
    }
    
    if (startDate) {
      paramCount++;
      query += ` AND mr.created_at >= $${paramCount}`;
      params.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ` AND mr.created_at <= $${paramCount}`;
      params.push(endDate);
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ requests: result.rows });
    
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching requests'
      }
    });
  }
}

// FR-17: Update request status (Manager only)
async function updateRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid status'
        }
      });
    }
    
    // Get request info for notification
    const requestResult = await pool.query(
      'SELECT user_id FROM maintenance_requests WHERE request_id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Request not found'
        }
      });
    }
    
    // Update status
    const resolvedAt = status === 'done' ? new Date() : null;
    const result = await pool.query(
      `UPDATE maintenance_requests 
       SET status = $1, resolved_at = $2
       WHERE request_id = $3
       RETURNING *`,
      [status, resolvedAt, requestId]
    );
    
    // TODO: FR-18 - Send notification to resident
    console.log('Request status updated:', requestId, status);
    
    res.json({
      request_id: result.rows[0].request_id,
      status: result.rows[0].status,
      resolved_at: result.rows[0].resolved_at
    });
    
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating request status'
      }
    });
  }
}

// FR-19: Rate completed request
async function rateRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { rating } = req.body;
    const userId = req.user.user_id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Rating must be between 1 and 5'
        }
      });
    }
    
    // Check if request exists and is completed
    const requestResult = await pool.query(
      'SELECT * FROM maintenance_requests WHERE request_id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Request not found'
        }
      });
    }
    
    const request = requestResult.rows[0];
    
    // Check if user owns the request
    if (request.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'RESOURCE_FORBIDDEN',
          message: 'You can only rate your own requests'
        }
      });
    }
    
    // Check if request is completed
    if (request.status !== 'done') {
      return res.status(422).json({
        error: {
          code: 'CONSTRAINT_VIOLATION',
          message: 'Only completed requests can be rated'
        }
      });
    }
    
    // Update rating
    await pool.query(
      'UPDATE maintenance_requests SET rating = $1 WHERE request_id = $2',
      [rating, requestId]
    );
    
    res.json({
      request_id: requestId,
      rating
    });
    
  } catch (error) {
    console.error('Rate request error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while rating the request'
      }
    });
  }
}

// Get all maintenance requests (Manager only)
async function getAllRequests(req, res) {
  try {
    const query = `
      SELECT 
        mr.*,
        CONCAT(a.block, '-', a.number) as apartment_number,
        u.name as resident_name
      FROM maintenance_requests mr
      LEFT JOIN apartments a ON mr.apartment_id = a.apartment_id
      LEFT JOIN users u ON mr.user_id = u.user_id
      ORDER BY mr.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ requests: result.rows });
    
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching requests'
      }
    });
  }
}

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
  rateRequest,
  getAllRequests
};
