const express = require('express');
const router = express.Router();
const { pool } = require('../db/schema');
const { verifyAdmin } = require('../middleware/auth');

// Get all users
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, unique_chat_id, user_id, display_name, role, account_status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/:userId', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, unique_chat_id, user_id, display_name, role, account_status, created_at FROM users WHERE id = $1',
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Suspend user account
router.patch('/:userId/suspend', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET account_status = $1 WHERE id = $2 RETURNING *',
      ['suspended', req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User suspended', user: result.rows[0] });
  } catch (err) {
    console.error('Suspend user error:', err);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Unsuspend user account
router.patch('/:userId/unsuspend', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET account_status = $1 WHERE id = $2 RETURNING *',
      ['active', req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User unsuspended', user: result.rows[0] });
  } catch (err) {
    console.error('Unsuspend user error:', err);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
});

// Get audit logs
router.get('/:userId/logs', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE admin_id = $1 ORDER BY created_at DESC LIMIT 100',
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
