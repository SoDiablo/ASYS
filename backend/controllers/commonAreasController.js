const pool = require('../config/database');

// Get all common areas
async function getAllCommonAreas(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM common_areas ORDER BY name ASC'
    );
    
    res.json({ areas: result.rows });
  } catch (error) {
    console.error('Get common areas error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching common areas'
      }
    });
  }
}

// Get active common areas (for residents)
async function getActiveCommonAreas(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM common_areas WHERE is_active = TRUE ORDER BY name ASC'
    );
    
    res.json({ areas: result.rows });
  } catch (error) {
    console.error('Get active common areas error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching common areas'
      }
    });
  }
}

// Create common area (Admin only)
async function createCommonArea(req, res) {
  try {
    const { name, capacity, max_hours, open_time, close_time } = req.body;
    
    if (!name || !capacity || !max_hours || !open_time || !close_time) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'All fields are required'
        }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO common_areas (name, capacity, max_hours, open_time, close_time, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [name, capacity, max_hours, open_time, close_time]
    );
    
    res.status(201).json({
      success: true,
      area: result.rows[0],
      message: 'Common area created successfully'
    });
  } catch (error) {
    console.error('Create common area error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating common area'
      }
    });
  }
}

// Update common area (Admin only)
async function updateCommonArea(req, res) {
  try {
    const { areaId } = req.params;
    const { name, capacity, max_hours, open_time, close_time, is_active } = req.body;
    
    let query = 'UPDATE common_areas SET ';
    const params = [];
    const updates = [];
    let paramCount = 0;
    
    if (name !== undefined) {
      paramCount++;
      updates.push('name = $' + paramCount);
      params.push(name);
    }
    
    if (capacity !== undefined) {
      paramCount++;
      updates.push('capacity = $' + paramCount);
      params.push(capacity);
    }
    
    if (max_hours !== undefined) {
      paramCount++;
      updates.push('max_hours = $' + paramCount);
      params.push(max_hours);
    }
    
    if (open_time !== undefined) {
      paramCount++;
      updates.push('open_time = $' + paramCount);
      params.push(open_time);
    }
    
    if (close_time !== undefined) {
      paramCount++;
      updates.push('close_time = $' + paramCount);
      params.push(close_time);
    }
    
    if (is_active !== undefined) {
      paramCount++;
      updates.push('is_active = $' + paramCount);
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'At least one field is required'
        }
      });
    }
    
    paramCount++;
    query += updates.join(', ') + ' WHERE area_id = $' + paramCount + ' RETURNING *';
    params.push(areaId);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Common area not found'
        }
      });
    }
    
    res.json({
      success: true,
      area: result.rows[0],
      message: 'Common area updated successfully'
    });
  } catch (error) {
    console.error('Update common area error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating common area'
      }
    });
  }
}

// Delete common area (Admin only)
async function deleteCommonArea(req, res) {
  try {
    const { areaId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM common_areas WHERE area_id = $1 RETURNING area_id',
      [areaId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Common area not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Common area deleted successfully'
    });
  } catch (error) {
    console.error('Delete common area error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting common area'
      }
    });
  }
}

module.exports = {
  getAllCommonAreas,
  getActiveCommonAreas,
  createCommonArea,
  updateCommonArea,
  deleteCommonArea
};
