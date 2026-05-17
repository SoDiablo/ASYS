const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { validateEmail, validatePhone, validatePassword, validateRequired } = require('../middlewares/validation');

// Create user account (Manager only)
async function createUser(req, res) {
  try {
    let { name, email, password, role, phone } = req.body;
    
    // Validate required fields
    const missing = validateRequired(['name', 'email', 'password', 'role'], req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: `Missing required fields: ${missing.join(', ')}`
        }
      });
    }
    
    // Convert email to lowercase for case-insensitive storage
    email = email.toLowerCase().trim();
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Invalid email format'
        }
      });
    }
    
    // Validate phone format
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Invalid phone format'
        }
      });
    }
    
    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Password must be between 8 and 20 characters'
        }
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'resident', 'security'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid role'
        }
      });
    }
    
    // Check email uniqueness (case-insensitive)
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE LOWER(email) = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists'
        }
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, role, phone, is_active, created_at`,
      [name, email, passwordHash, role, phone || null]
    );
    
    res.status(201).json({
      user_id: result.rows[0].user_id,
      email: result.rows[0].email,
      role: result.rows[0].role
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating user'
      }
    });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'RESOURCE_FORBIDDEN',
          message: 'You can only view your own profile'
        }
      });
    }
    
    const result = await pool.query(
      'SELECT user_id, name, email, role, phone, is_active, created_at FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching user'
      }
    });
  }
}

// Update user profile
async function updateUser(req, res) {
  const client = await pool.connect();
  try {
    const { userId } = req.params;
    const { name, phone, apartment_id, role } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'RESOURCE_FORBIDDEN',
          message: 'You can only update your own profile'
        }
      });
    }
    
    if (!name && !phone && apartment_id === undefined && !role) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'At least one field (name, phone, apartment_id, or role) is required'
        }
      });
    }
    
    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Invalid phone format'
        }
      });
    }
    
    await client.query('BEGIN');
    
    // Update user table if name, phone, or role provided
    if (name || phone || role) {
      let query = 'UPDATE users SET ';
      const params = [];
      const updates = [];
      let paramCount = 0;
      
      if (name) {
        paramCount++;
        updates.push('name = $' + paramCount);
        params.push(name);
      }
      
      if (phone) {
        paramCount++;
        updates.push('phone = $' + paramCount);
        params.push(phone);
      }
      
      if (role && req.user.role === 'admin') {
        // Validate role
        if (!['resident', 'admin', 'security'].includes(role)) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: {
              code: 'INVALID_VALUE',
              message: 'Invalid role. Must be resident, admin, or security'
            }
          });
        }
        paramCount++;
        updates.push('role = $' + paramCount);
        params.push(role);
      }
      
      paramCount++;
      query += updates.join(', ') + ' WHERE user_id = $' + paramCount + ' RETURNING user_id, name, email, role, phone';
      params.push(userId);
      
      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
    }
    
    // Handle apartment assignment (admin only)
    if (apartment_id !== undefined && req.user.role === 'admin') {
      // First, unassign user from any current apartment
      await client.query(
        'UPDATE apartments SET user_id = NULL, is_occupied = FALSE WHERE user_id = $1',
        [userId]
      );
      
      // If apartment_id is provided (not empty), assign to new apartment
      if (apartment_id && apartment_id.trim() !== '') {
        // Parse apartment number format: "B-202" -> block: "B", number: "202"
        const parts = apartment_id.trim().split('-');
        if (parts.length !== 2) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: {
              code: 'INVALID_FORMAT',
              message: 'Apartment format must be Block-Number (e.g., B-202)'
            }
          });
        }
        
        const block = parts[0].toUpperCase().trim();
        const number = parts[1].trim();
        
        // Validate max 3 characters for both block and number
        if (block.length === 0 || block.length > 3) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: {
              code: 'INVALID_FORMAT',
              message: 'Block must be 1-3 characters (e.g., A, B, C1)'
            }
          });
        }
        
        if (number.length === 0 || number.length > 3) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: {
              code: 'INVALID_FORMAT',
              message: 'Number must be 1-3 characters (e.g., 101, 202, 5)'
            }
          });
        }
        
        // Check if apartment exists by block and number
        let aptCheck = await client.query(
          'SELECT apartment_id FROM apartments WHERE block = $1 AND number = $2',
          [block, number]
        );
        
        let apartmentId;
        
        // If apartment doesn't exist, create it
        if (aptCheck.rows.length === 0) {
          // Calculate floor from number (first digit, or 0 if single digit)
          const floor = number.length === 1 ? 0 : parseInt(number.charAt(0));
          
          const newApt = await client.query(
            `INSERT INTO apartments (block, floor, number, monthly_due, is_occupied)
             VALUES ($1, $2, $3, $4, FALSE)
             RETURNING apartment_id`,
            [block, floor, number, 500.00]
          );
          apartmentId = newApt.rows[0].apartment_id;
        } else {
          apartmentId = aptCheck.rows[0].apartment_id;
        }
        
        // Assign user to apartment
        await client.query(
          'UPDATE apartments SET user_id = $1, is_occupied = TRUE WHERE apartment_id = $2',
          [userId, apartmentId]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Fetch updated user data with apartment info
    const finalResult = await client.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.phone, a.apartment_id,
       CONCAT(a.block, '-', a.number) as apartment_number
       FROM users u
       LEFT JOIN apartments a ON u.user_id = a.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    
    res.json({
      success: true,
      data: finalResult.rows[0],
      message: 'User updated successfully'
    });
    
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    console.error('Update user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating user'
      }
    });
  } finally {
    client.release();
  }
}

// Reset user password to default (Admin only)
async function resetUserPassword(req, res) {
  try {
    const { userId } = req.params;
    const defaultPassword = '12345678';
    
    // Hash default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [passwordHash, userId]
    );
    
    res.json({
      success: true,
      message: 'Password reset to default: 12345678'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while resetting password'
      }
    });
  }
}

// Delete user (Admin only)
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    
    // Prevent deleting yourself
    if (req.user.user_id === parseInt(userId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OPERATION',
          message: 'Cannot delete your own account'
        }
      });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting user'
      }
    });
  }
}

// Get all users (Manager only)
async function getAllUsers(req, res) {
  try {
    const { role, is_active } = req.query;
    
    let query = `SELECT u.user_id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at,
                 CONCAT(a.block, '-', a.number) as apartment_number
                 FROM users u
                 LEFT JOIN apartments a ON u.user_id = a.user_id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 0;
    
    if (role) {
      paramCount++;
      query += ' AND u.role = $' + paramCount;
      params.push(role);
    }
    
    if (is_active !== undefined) {
      paramCount++;
      query += ' AND u.is_active = $' + paramCount;
      params.push(is_active === 'true');
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ users: result.rows });
    
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching users'
      }
    });
  }
}

module.exports = {
  createUser,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  getAllUsers
};
