const pool = require('../config/database');

// FR-25: Get all common areas
async function getCommonAreas(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM common_areas WHERE is_active = true ORDER BY name'
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

// FR-26: Get availability for a common area
async function getAvailability(req, res) {
  try {
    const { area_id, date } = req.query;
    
    if (!area_id || !date) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'area_id and date are required'
        }
      });
    }
    
    // Get area details
    const areaResult = await pool.query(
      'SELECT * FROM common_areas WHERE area_id = $1',
      [area_id]
    );
    
    if (areaResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Common area not found'
        }
      });
    }
    
    // Get existing reservations for the date
    const reservationsResult = await pool.query(
      `SELECT start_time, end_time FROM reservations
       WHERE area_id = $1 
       AND DATE(start_time) = $2
       AND status = 'active'
       ORDER BY start_time`,
      [area_id, date]
    );
    
    res.json({
      area: areaResult.rows[0],
      booked_slots: reservationsResult.rows
    });
    
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching availability'
      }
    });
  }
}

// FR-25, FR-26, FR-27, FR-30, BR-08, BR-09, BR-10, BR-11: Create reservation
async function createReservation(req, res) {
  const client = await pool.connect();
  
  try {
    const { area_id, start_time, end_time, guest_count } = req.body;
    const userId = req.user.user_id;
    
    if (!area_id || !start_time || !end_time) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'area_id, start_time, and end_time are required'
        }
      });
    }
    
    await client.query('BEGIN');
    
    // Get user's apartment
    const apartmentResult = await client.query(
      'SELECT * FROM apartments WHERE user_id = $1',
      [userId]
    );
    
    if (apartmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: {
          code: 'CONSTRAINT_VIOLATION',
          message: 'User is not assigned to an apartment'
        }
      });
    }
    
    const apartment = apartmentResult.rows[0];
    
    // BR-10: Check for outstanding dues
    const overdueResult = await client.query(
      `SELECT COUNT(*) FROM dues 
       WHERE apartment_id = $1 AND status = 'overdue'`,
      [apartment.apartment_id]
    );
    
    if (parseInt(overdueResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: {
          code: 'OUTSTANDING_DUES',
          message: 'Cannot make reservations with outstanding dues'
        }
      });
    }
    
    // BR-11: Check time restrictions (23:00-07:00)
    const startHour = new Date(start_time).getHours();
    const endHour = new Date(end_time).getHours();
    
    if (startHour >= 23 || startHour < 7 || endHour >= 23 || endHour < 7) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: {
          code: 'INVALID_TIME_RANGE',
          message: 'Reservations are not allowed between 23:00 and 07:00'
        }
      });
    }
    
    // FR-30: Check daily limit (1 per area per day)
    const dailyLimitResult = await client.query(
      `SELECT COUNT(*) FROM reservations
       WHERE user_id = $1 AND area_id = $2
       AND DATE(start_time) = DATE($3::timestamp)
       AND status = 'active'`,
      [userId, area_id, start_time]
    );
    
    if (parseInt(dailyLimitResult.rows[0].count) >= 1) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: 'You have already reserved this area today'
        }
      });
    }
    
    // Get area details for duration check
    const areaResult = await client.query(
      'SELECT * FROM common_areas WHERE area_id = $1',
      [area_id]
    );
    
    if (areaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Common area not found'
        }
      });
    }
    
    const area = areaResult.rows[0];
    
    // BR-08, BR-09: Check duration limits
    const durationHours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);
    
    if (durationHours > area.max_hours) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: {
          code: 'INVALID_TIME_RANGE',
          message: `Maximum duration for ${area.name} is ${area.max_hours} hours`
        }
      });
    }
    
    // FR-27: Check for conflicts
    const conflictResult = await client.query(
      `SELECT COUNT(*) FROM reservations
       WHERE area_id = $1 AND status = 'active'
       AND (
         (start_time <= $2::timestamp AND end_time > $2::timestamp) OR
         (start_time < $3::timestamp AND end_time >= $3::timestamp) OR
         (start_time >= $2::timestamp AND end_time <= $3::timestamp)
       )`,
      [area_id, start_time, end_time]
    );
    
    if (parseInt(conflictResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        error: {
          code: 'RESERVATION_CONFLICT',
          message: 'This time slot is already reserved'
        }
      });
    }
    
    // Create reservation with guest_count
    const insertQuery = guest_count 
      ? `INSERT INTO reservations (area_id, user_id, start_time, end_time, guest_count)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`
      : `INSERT INTO reservations (area_id, user_id, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING *`;
    
    const insertParams = guest_count 
      ? [area_id, userId, start_time, end_time, guest_count]
      : [area_id, userId, start_time, end_time];
    
    const result = await client.query(insertQuery, insertParams);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      reservation_id: result.rows[0].reservation_id,
      status: result.rows[0].status
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create reservation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating reservation'
      }
    });
  } finally {
    client.release();
  }
}

// Update reservation (Admin only)
async function updateReservation(req, res) {
  try {
    const { reservationId } = req.params;
    const { area_id, start_time, end_time, status, guest_count } = req.body;
    
    const updates = [];
    const params = [];
    let paramCount = 0;
    
    if (area_id !== undefined) {
      paramCount++;
      updates.push(`area_id = $${paramCount}`);
      params.push(area_id);
    }
    
    if (start_time !== undefined) {
      paramCount++;
      updates.push(`start_time = $${paramCount}`);
      params.push(start_time);
    }
    
    if (end_time !== undefined) {
      paramCount++;
      updates.push(`end_time = $${paramCount}`);
      params.push(end_time);
    }
    
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }
    
    if (guest_count !== undefined) {
      paramCount++;
      updates.push(`guest_count = $${paramCount}`);
      params.push(guest_count);
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
    const query = `UPDATE reservations SET ${updates.join(', ')} WHERE reservation_id = $${paramCount} RETURNING *`;
    params.push(reservationId);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Reservation not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Reservation updated successfully'
    });
    
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating reservation'
      }
    });
  }
}

// FR-28, FR-29: Cancel reservation
async function cancelReservation(req, res) {
  try {
    const { reservationId } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // Get reservation details
    const reservationResult = await pool.query(
      'SELECT * FROM reservations WHERE reservation_id = $1',
      [reservationId]
    );
    
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Reservation not found'
        }
      });
    }
    
    const reservation = reservationResult.rows[0];
    
    // Check ownership (unless Manager)
    if (userRole !== 'admin' && reservation.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'RESOURCE_FORBIDDEN',
          message: 'You can only cancel your own reservations'
        }
      });
    }
    
    // FR-28: Check 2-hour cancellation notice (unless Manager)
    if (userRole !== 'admin') {
      const hoursUntilStart = (new Date(reservation.start_time) - new Date()) / (1000 * 60 * 60);
      
      if (hoursUntilStart < 2) {
        return res.status(422).json({
          error: {
            code: 'CANCELLATION_TOO_LATE',
            message: 'Reservations must be cancelled at least 2 hours before start time'
          }
        });
      }
    }
    
    // Cancel reservation
    await pool.query(
      `UPDATE reservations 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE reservation_id = $1`,
      [reservationId]
    );
    
    res.json({ message: 'Reservation cancelled successfully' });
    
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while cancelling reservation'
      }
    });
  }
}

// Get user's reservations
async function getUserReservations(req, res) {
  try {
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    let query = `
      SELECT r.*, ca.name as area_name
      FROM reservations r
      JOIN common_areas ca ON r.area_id = ca.area_id
    `;
    
    const params = [];
    
    // Residents see only their own reservations
    if (userRole === 'resident') {
      query += ' WHERE r.user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY r.start_time DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ reservations: result.rows });
    
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching reservations'
      }
    });
  }
}

// Get all reservations (Manager only)
async function getAllReservations(req, res) {
  try {
    const query = `
      SELECT 
        r.*,
        ca.name as area_name,
        u.name as user_name
      FROM reservations r
      JOIN common_areas ca ON r.area_id = ca.area_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.start_time DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ reservations: result.rows });
    
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching reservations'
      }
    });
  }
}

module.exports = {
  getCommonAreas,
  getAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
  getUserReservations,
  getAllReservations
};
