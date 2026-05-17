// Input validation and sanitization middleware

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
}

function validatePassword(password) {
  return password && password.length >= 8 && password.length <= 20;
}

function validateRequired(fields, body) {
  const missing = [];
  for (const field of fields) {
    if (!body[field]) {
      missing.push(field);
    }
  }
  return missing;
}

function sanitizeRequestBody(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  sanitizeRequestBody
};
