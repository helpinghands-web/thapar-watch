const express = require('express');
const { authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Check admin authorization
router.use(authorizeAdmin);

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.query;

    let query = `
      SELECT r.id, r.optional_name, r.description, r.status, r.created_at, u.display_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE r.status = $1';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await db.query(query, params);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get report details with media
router.get('/reports/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const reportResult = await db.query(
      `SELECT r.*, u.display_name, u.user_id
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const mediaResult = await db.query('SELECT id, file_name, file_path, file_type FROM media_files WHERE report_id = $1', [
      id,
    ]);

    res.json({
      report: reportResult.rows[0],
      media: mediaResult.rows,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Update report status
router.patch('/reports/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'approved', 'rejected', 'published'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.query(
      `UPDATE reports SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, status`,
      [status, admin_notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'UPDATE_REPORT_STATUS', 'report', id, `Status changed to: ${status}`]
    );

    res.json({ message: 'Report updated', report: result.rows[0] });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      'SELECT id, user_id, display_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Deactivate user
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    if (id === req.user.id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const result = await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, user_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated', user: result.rows[0] });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Get audit logs
router.get('/logs', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      `SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at, u.display_name
       FROM audit_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;