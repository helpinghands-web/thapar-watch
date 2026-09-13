const express = require('express');
const router = express.Router();
const { pool } = require('../db/schema');
const { verifyAdmin } = require('../middleware/auth');

// Get all audit logs
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { action, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      query += ' AND action = $' + (params.length + 1);
      params.push(action);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Log an admin action
const logAdminAction = async (adminId, action, targetType, targetId, details, ipAddress) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress]
    );
  } catch (err) {
    console.error('Log action error:', err);
  }
};

module.exports = { router, logAdminAction };
