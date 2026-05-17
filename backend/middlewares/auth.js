const jwt = require('jsonwebtoken');

// Authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: { 
        code: 'NO_TOKEN', 
        message: 'No token provided' 
      } 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: { 
          code: 'TOKEN_INVALID', 
          message: 'Invalid or expired token' 
        } 
      });
    }
    req.user = user; // { user_id, role, email }
    next();
  });
}

// Authorize based on role (RBAC)
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'User not authenticated' 
        } 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: { 
          code: 'INSUFFICIENT_PERMISSIONS', 
          message: 'Insufficient permissions for this action' 
        } 
      });
    }
    
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
