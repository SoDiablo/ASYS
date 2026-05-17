const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { validateEmail, validatePhone, validatePassword, validateRequired } = require('../middlewares/validation');

// Public user registration (for self-signup)
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    let { name, email, password, role, phone, apartment_id } = req.body;
    
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
    
    // Validate role (only allow resident and admin for self-signup)
    const validRoles = ['admin', 'resident'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid role for self-signup'
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
    
    await client.query('BEGIN');
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, role, phone, is_active, created_at`,
      [name, email, passwordHash, role, phone || null]
    );
    
    const userId = result.rows[0].user_id;
    
    // If apartment_id provided, assign user to apartment
    if (apartment_id && apartment_id.trim() !== '') {
      // Parse apartment number format: "B-202" -> block: "B", number: "202"
      const parts = apartment_id.trim().split('-');
      if (parts.length === 2) {
        const block = parts[0].toUpperCase().trim();
        const number = parts[1].trim();
        
        // Validate max 3 characters for both block and number
        if (block.length > 0 && block.length <= 3 && number.length > 0 && number.length <= 3) {
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
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      user_id: result.rows[0].user_id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      message: 'Account created successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during registration'
      }
    });
  } finally {
    client.release();
  }
});

module.exports = router;