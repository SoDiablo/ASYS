const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { validateEmail, validatePassword, validateRequired } = require('../middlewares/validation');

// FR-01, FR-02: User login with JWT generation
async function login(req, res) {
  try {
    let { email, password } = req.body;
    
    // Validate required fields
    const missing = validateRequired(['email', 'password'], req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: `Missing required fields: ${missing.join(', ')}`
        }
      });
    }
    
    // Convert email to lowercase for case-insensitive login
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
    
    // Get user from database (case-insensitive)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    const user = userResult.rows[0];
    
    // NFR-05: Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is locked due to multiple failed login attempts. Please try again later.'
        }
      });
    }
    
    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account has been deactivated'
        }
      });
    }
    
    // FR-05: Verify password with BCrypt
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      // NFR-05: Increment failed login attempts
      const newAttempts = user.failed_login_attempts + 1;
      let lockUntil = null;
      
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1, account_locked_until = $2 WHERE user_id = $3',
        [newAttempts, lockUntil, user.user_id]
      );
      
      if (lockUntil) {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account locked due to 5 failed login attempts. Please try again in 15 minutes.'
          }
        });
      }
      
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Reset failed login attempts on successful login
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE user_id = $1',
      [user.user_id]
    );
    
    // FR-02, FR-03: Generate JWT token with 24-hour expiration
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        role: user.role, 
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login'
      }
    });
  }
}

// FR-06: Forgot password - send reset link
async function forgotPassword(req, res) {
  try {
    let { email } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Valid email is required'
        }
      });
    }
    
    // Convert to lowercase for case-insensitive lookup
    email = email.toLowerCase().trim();
    
    const userResult = await pool.query(
      'SELECT user_id, email FROM users WHERE LOWER(email) = $1',
      [email]
    );
    
    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.json({ 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Generate reset token with 15-minute expiration
    const resetToken = jwt.sign(
      { user_id: user.user_id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // TODO: Send email with reset link
    // For now, just log the token (in production, send via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    
    res.json({ 
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Remove this in production - only for development
      token: resetToken
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred'
      }
    });
  }
}

// FR-06: Reset password with token
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Token and new password are required'
        }
      });
    }
    
    // Validate password length (8-20 characters)
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Password must be between 8 and 20 characters'
        }
      });
    }
    
    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (err) {
      return res.status(403).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid or expired reset token'
        }
      });
    }
    
    // FR-05: Hash new password with BCrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [passwordHash, decoded.user_id]
    );
    
    res.json({ 
      success: true,
      message: 'Password updated successfully' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred'
      }
    });
  }
}

// FR-07: Activate/deactivate user account (Manager only)
async function activateUser(req, res) {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'is_active must be a boolean'
        }
      });
    }
    
    await pool.query(
      'UPDATE users SET is_active = $1 WHERE user_id = $2',
      [is_active, userId]
    );
    
    res.json({ message: 'User status updated successfully' });
    
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred'
      }
    });
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  activateUser
};
