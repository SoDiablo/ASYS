const pool = require('../config/database');

// Get all parking spots
async function getParkingSpots(req, res) {
  try {
    const userId = req.user?.user_id;
    const userRole = req.user?.role;
    
    let query = `
      SELECT ps.*, a.block, a.floor, a.number as apartment_number,
      CONCAT(a.block, '-', a.number) as apartment_display
      FROM parking_spots ps
      LEFT JOIN apartments a ON ps.apartment_id = a.apartment_id
    `;
    
    // For residents, mark their own spot
    if (userRole === 'resident' && userId) {
      query = `
        SELECT ps.*, a.block, a.floor, a.number as apartment_number,
        CONCAT(a.block, '-', a.number) as apartment_display,
        CASE WHEN a.user_id = $1 THEN true ELSE false END as is_mine
        FROM parking_spots ps
        LEFT JOIN apartments a ON ps.apartment_id = a.apartment_id
      `;
    }
    
    query += ' ORDER BY ps.spot_number';
    
    const params = userRole === 'resident' && userId ? [userId] : [];
    const result = await pool.query(query, params);
    
    res.json({ success: true, spots: result.rows });
    
  } catch (error) {
    console.error('Get parking spots error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching parking spots'
      }
    });
  }
}

// Create parking spot (Admin only)
async function createParkingSpot(req, res) {
  try {
    const { spot_number, type, apartment_id, plate_number } = req.body;
    
    if (!spot_number || !type) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'spot_number and type are required'
        }
      });
    }
    
    // Validate spot_number format: Letter-3digits max (e.g., P-101, A-1, B-999)
    const spotPattern = /^[A-Z]-\d{1,3}$/i;
    if (!spotPattern.test(spot_number)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Spot number must be in format: Letter-Number (e.g., P-101, A-1)'
        }
      });
    }
    
    // Validate type
    const validTypes = ['standard', 'handicapped', 'visitor'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid type. Must be standard, handicapped, or visitor'
        }
      });
    }
    
    // Check if spot number already exists
    const existing = await pool.query(
      'SELECT spot_id FROM parking_spots WHERE spot_number = $1',
      [spot_number]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_SPOT',
          message: 'Spot number already exists'
        }
      });
    }
    
    // Handle apartment_id if provided in "Block-Number" format
    let finalApartmentId = null;
    if (apartment_id && apartment_id.trim() !== '') {
      const parts = apartment_id.trim().split('-');
      if (parts.length === 2) {
        const block = parts[0].toUpperCase().trim();
        const number = parts[1].trim();
        
        // Validate block and number length
        if (block.length === 0 || block.length > 3 || number.length === 0 || number.length > 3) {
          return res.status(400).json({
            error: {
              code: 'INVALID_FORMAT',
              message: 'Apartment format: Block-Number (max 3 chars each, e.g., B-202)'
            }
          });
        }
        
        // Find or create apartment
        let aptResult = await pool.query(
          'SELECT apartment_id FROM apartments WHERE block = $1 AND number = $2',
          [block, number]
        );
        
        if (aptResult.rows.length === 0) {
          // Create apartment
          const floor = number.length === 1 ? 0 : parseInt(number.charAt(0));
          aptResult = await pool.query(
            'INSERT INTO apartments (block, floor, number, monthly_due, is_occupied) VALUES ($1, $2, $3, $4, FALSE) RETURNING apartment_id',
            [block, floor, number, 500.00]
          );
        }
        
        finalApartmentId = aptResult.rows[0].apartment_id;
      }
    }
    
    const result = await pool.query(
      'INSERT INTO parking_spots (spot_number, type, apartment_id, is_occupied, plate_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [spot_number, type, finalApartmentId, finalApartmentId ? true : false, plate_number || null]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Parking spot created successfully'
    });
    
  } catch (error) {
    console.error('Create parking spot error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating parking spot'
      }
    });
  }
}

// Update parking spot (Admin or Resident claiming/releasing)
async function updateParkingSpot(req, res) {
  try {
    const { spotId } = req.params;
    const { spot_number, type, apartment_id, is_occupied, plate_number } = req.body;
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // If resident, get their apartment_id
    let residentApartmentId = null;
    if (userRole === 'resident') {
      const apartmentResult = await pool.query(
        'SELECT apartment_id FROM apartments WHERE user_id = $1',
        [userId]
      );
      
      if (apartmentResult.rows.length > 0) {
        residentApartmentId = apartmentResult.rows[0].apartment_id;
      }
    }
    
    const updates = [];
    const params = [];
    let paramCount = 0;
    
    // Admin can update everything
    if (userRole === 'admin') {
      if (spot_number !== undefined) {
        // Validate spot_number format
        const spotPattern = /^[A-Z]-\d{1,3}$/i;
        if (!spotPattern.test(spot_number)) {
          return res.status(400).json({
            error: {
              code: 'INVALID_FORMAT',
              message: 'Spot number must be in format: Letter-Number (e.g., P-101)'
            }
          });
        }
        paramCount++;
        updates.push('spot_number = $' + paramCount);
        params.push(spot_number);
      }
      
      if (type !== undefined) {
        paramCount++;
        updates.push('type = $' + paramCount);
        params.push(type);
      }
      
      if (plate_number !== undefined) {
        paramCount++;
        updates.push('plate_number = $' + paramCount);
        params.push(plate_number || null);
      }
    }
    
    // Both admin and resident can update apartment_id and is_occupied
    if (apartment_id !== undefined) {
      paramCount++;
      updates.push('apartment_id = $' + paramCount);
      // Resident can only assign to their own apartment
      params.push(userRole === 'resident' ? residentApartmentId : (apartment_id || null));
    }
    
    if (is_occupied !== undefined) {
      paramCount++;
      updates.push('is_occupied = $' + paramCount);
      params.push(is_occupied);
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
    const query = 'UPDATE parking_spots SET ' + updates.join(', ') + ' WHERE spot_id = $' + paramCount + ' RETURNING *';
    params.push(spotId);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Parking spot not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Parking spot updated successfully'
    });
    
  } catch (error) {
    console.error('Update parking spot error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating parking spot'
      }
    });
  }
}

// Delete parking spot (Admin only)
async function deleteParkingSpot(req, res) {
  try {
    const { spotId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM parking_spots WHERE spot_id = $1 RETURNING *',
      [spotId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Parking spot not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Parking spot deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete parking spot error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting parking spot'
      }
    });
  }
}

// Assign parking spot (Manager only)
async function assignParkingSpot(req, res) {
  try {
    const { spotId } = req.params;
    const { apartment_id } = req.body;
    
    if (!apartment_id) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'apartment_id is required'
        }
      });
    }
    
    // Handle apartment_id in "Block-Number" format
    let finalApartmentId = apartment_id;
    const parts = apartment_id.trim().split('-');
    if (parts.length === 2) {
      const block = parts[0].toUpperCase().trim();
      const number = parts[1].trim();
      
      let aptResult = await pool.query(
        'SELECT apartment_id FROM apartments WHERE block = $1 AND number = $2',
        [block, number]
      );
      
      if (aptResult.rows.length === 0) {
        const floor = number.length === 1 ? 0 : parseInt(number.charAt(0));
        aptResult = await pool.query(
          'INSERT INTO apartments (block, floor, number, monthly_due, is_occupied) VALUES ($1, $2, $3, $4, FALSE) RETURNING apartment_id',
          [block, floor, number, 500.00]
        );
      }
      
      finalApartmentId = aptResult.rows[0].apartment_id;
    }
    
    // Check apartment parking limit (max 2 spots)
    const assignedSpotsResult = await pool.query(
      'SELECT COUNT(*) FROM parking_spots WHERE apartment_id = $1',
      [finalApartmentId]
    );
    
    const assignedCount = parseInt(assignedSpotsResult.rows[0].count);
    if (assignedCount >= 2) {
      return res.status(422).json({
        error: {
          code: 'MAX_PARKING_EXCEEDED',
          message: 'Maximum 2 parking spots per apartment'
        }
      });
    }
    
    // Assign spot
    await pool.query(
      'UPDATE parking_spots SET apartment_id = $1, is_occupied = TRUE WHERE spot_id = $2',
      [finalApartmentId, spotId]
    );
    
    res.json({
      spot_id: spotId,
      apartment_id: finalApartmentId
    });
    
  } catch (error) {
    console.error('Assign parking spot error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while assigning parking spot'
      }
    });
  }
}

// Register visitor vehicle (Security only)
async function registerVisitor(req, res) {
  try {
    const { plate_number, spot_id, visited_apartment_id } = req.body;
    const securityId = req.user.user_id;
    
    if (!plate_number || !spot_id || !visited_apartment_id) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'plate_number, spot_id, and visited_apartment_id are required'
        }
      });
    }
    
    const result = await pool.query(
      'INSERT INTO visitor_vehicles (plate_number, spot_id, visited_apartment_id, registered_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [plate_number, spot_id, visited_apartment_id, securityId]
    );
    
    const maxDuration = new Date(result.rows[0].entry_time);
    maxDuration.setHours(maxDuration.getHours() + 4);
    
    res.status(201).json({
      visit_id: result.rows[0].visit_id,
      entry_time: result.rows[0].entry_time,
      max_duration: maxDuration
    });
    
  } catch (error) {
    console.error('Register visitor error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while registering visitor'
      }
    });
  }
}

// Record visitor exit (Security only)
async function recordVisitorExit(req, res) {
  try {
    const { visitId } = req.params;
    
    const result = await pool.query(
      'UPDATE visitor_vehicles SET exit_time = NOW() WHERE visit_id = $1 RETURNING *',
      [visitId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Visitor record not found'
        }
      });
    }
    
    const visit = result.rows[0];
    const duration = (new Date(visit.exit_time) - new Date(visit.entry_time)) / (1000 * 60 * 60);
    
    res.json({
      visit_id: visit.visit_id,
      exit_time: visit.exit_time,
      duration: duration.toFixed(2) + ' hours'
    });
    
  } catch (error) {
    console.error('Record visitor exit error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while recording exit'
      }
    });
  }
}

// Get overstay alerts (Security only)
async function getOverstayAlerts(req, res) {
  try {
    const result = await pool.query(
      `SELECT vv.*, ps.spot_number, a.block, a.floor, a.number
       FROM visitor_vehicles vv
       JOIN parking_spots ps ON vv.spot_id = ps.spot_id
       JOIN apartments a ON vv.visited_apartment_id = a.apartment_id
       WHERE vv.exit_time IS NULL
       AND vv.entry_time < NOW() - INTERVAL '4 hours'
       ORDER BY vv.entry_time`
    );
    
    const overstayVehicles = result.rows.map(vehicle => {
      const hoursExceeded = (new Date() - new Date(vehicle.entry_time)) / (1000 * 60 * 60) - 4;
      return {
        ...vehicle,
        hours_exceeded: hoursExceeded.toFixed(2)
      };
    });
    
    res.json({ overstay_vehicles: overstayVehicles });
    
  } catch (error) {
    console.error('Get overstay alerts error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching overstay alerts'
      }
    });
  }
}

module.exports = {
  getParkingSpots,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot,
  assignParkingSpot,
  registerVisitor,
  recordVisitorExit,
  getOverstayAlerts
};
