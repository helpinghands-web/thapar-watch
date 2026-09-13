const jwt = require('jsonwebtoken');
const { pool } = require('../db/schema');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const rateLimitByIP = require('express-rate-limit').rateLimit;

const loginLimiter = rateLimitByIP({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimitByIP({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Upload limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { verifyToken, verifyAdmin, loginLimiter, uploadLimiter };
