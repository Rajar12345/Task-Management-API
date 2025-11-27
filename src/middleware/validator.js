// src/middleware/validator.js
// Simple request body validator helpers used in routes

function requireFields(fields = []) {
  return (req, res, next) => {
    const missing = [];
    fields.forEach((f) => {
      if (req.body[f] === undefined || req.body[f] === null || req.body[f] === '') {
        missing.push(f);
      }
    });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: missing
      });
    }
    next();
  };
}

module.exports = { requireFields };
