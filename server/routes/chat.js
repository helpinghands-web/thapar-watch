const express = require('express');
const router = express.Router();
const { pool } = require('../db/schema');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { isChatOpen } = require('../utils/chatScheduler');

// Get chat status
router.get('/status', async (req, res) => {
  try {
    const settings = await pool.query(
      'SELECT * FROM chat_settings WHERE setting_key IN ($1, $2, $3)',
      ['chat_open_time', 'chat_close_time', 'chat_timezone']
    );

    const settingsMap = {};
    settings.rows.forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    res.json({
      is_open: isChatOpen(),
      open_time: settingsMap['chat_open_time'] || '22:00',
      close_time: settingsMap['chat_close_time'] || '04:00',
      timezone: settingsMap['chat_timezone'] || 'Asia/Kolkata',
    });
  } catch (err) {
    console.error('Chat status error:', err);
    res.status(500).json({ error: 'Failed to fetch chat status' });
  }
});

// Send a message
router.post('/messages', verifyToken, async (req, res) => {
  try {
    if (!isChatOpen()) {
      return res.status(403).json({ error: 'Chat is currently closed. Hours: 10 PM to 4 AM IST' });
    }

    const { message_text } = req.body;

    if (!message_text || message_text.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message_text.length > 5000) {
      return res.status(400).json({ error: 'Message is too long (max 5000 characters)' });
    }

    // Check if user is blocked
    const blocked = await pool.query(
      'SELECT id FROM blocked_users WHERE user_id = $1 AND unblocked_at IS NULL',
      [req.user.id]
    );

    if (blocked.rows.length > 0) {
      return res.status(403).json({ error: 'Your account is suspended from chat.' });
    }

    // Insert message
    const result = await pool.query(
      'INSERT INTO chat_messages (sender_id, message_text, moderation_status) VALUES ($1, $2, $3) RETURNING id, sender_id, message_text, created_at',
      [req.user.id, message_text, 'approved']
    );

    const message = result.rows[0];

    res.status(201).json({
      id: message.id,
      sender_id: message.sender_id,
      message_text: message.message_text,
      created_at: message.created_at,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat messages with pagination
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        cm.id, cm.sender_id, cm.message_text, cm.created_at,
        u.user_id, u.display_name
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.moderation_status = 'approved'
      ORDER BY cm.created_at DESC
      LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    res.json(result.rows.reverse());
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Report a message (user)
router.post('/messages/:messageId/report', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    await pool.query(
      'INSERT INTO reported_messages (message_id, reported_by, reason) VALUES ($1, $2, $3)',
      [messageId, req.user.id, reason]
    );

    res.json({ message: 'Message reported successfully' });
  } catch (err) {
    console.error('Report message error:', err);
    res.status(500).json({ error: 'Failed to report message' });
  }
});

// Admin: Get all chat messages (with moderation)
router.get('/admin/messages', verifyAdmin, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT 
      cm.id, cm.sender_id, cm.message_text, cm.moderation_status, cm.created_at,
      u.user_id, u.display_name
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE 1=1`;

    const params = [];

    if (status !== 'all') {
      query += ' AND cm.moderation_status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY cm.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Admin fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Admin: Get reported messages
router.get('/admin/reported', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        rm.id, rm.message_id, rm.reason, rm.created_at,
        cm.message_text, cm.created_at as message_created_at,
        u.user_id, u.display_name
      FROM reported_messages rm
      JOIN chat_messages cm ON rm.message_id = cm.id
      JOIN users u ON cm.sender_id = u.id
      ORDER BY rm.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Admin fetch reported error:', err);
    res.status(500).json({ error: 'Failed to fetch reported messages' });
  }
});

// Admin: Delete a message
router.delete('/admin/messages/:messageId', verifyAdmin, async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await pool.query('DELETE FROM chat_messages WHERE id = $1 RETURNING *', [messageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Admin delete message error:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Admin: Suspend a user from chat
router.post('/admin/users/:userId/suspend', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    await pool.query(
      'INSERT INTO blocked_users (user_id, blocked_reason) VALUES ($1, $2)',
      [userId, reason || 'Suspended by admin']
    );

    res.json({ message: 'User suspended from chat' });
  } catch (err) {
    console.error('Suspend user error:', err);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Admin: Unsuspend a user
router.post('/admin/users/:userId/unsuspend', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      'UPDATE blocked_users SET unblocked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND unblocked_at IS NULL',
      [userId]
    );

    res.json({ message: 'User unsuspended' });
  } catch (err) {
    console.error('Unsuspend user error:', err);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
});

// Admin: Get chat settings
router.get('/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chat_settings');
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Admin: Update chat settings
router.patch('/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const { chat_open_time, chat_close_time, message_retention_days } = req.body;

    if (chat_open_time) {
      await pool.query(
        'UPDATE chat_settings SET setting_value = $1 WHERE setting_key = $2',
        [chat_open_time, 'chat_open_time']
      );
    }

    if (chat_close_time) {
      await pool.query(
        'UPDATE chat_settings SET setting_value = $1 WHERE setting_key = $2',
        [chat_close_time, 'chat_close_time']
      );
    }

    if (message_retention_days) {
      await pool.query(
        'UPDATE chat_settings SET setting_value = $1 WHERE setting_key = $2',
        [message_retention_days, 'message_retention_days']
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
