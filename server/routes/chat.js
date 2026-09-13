const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Chat status
router.get('/status', (req, res) => {
  const now = new Date();
  const hours = now.getHours();

  // Chat is open from 10 PM (22:00) to 4 AM (04:00) IST
  const isOpen = hours >= 22 || hours < 4;

  res.json({
    is_open: isOpen,
    open_time: '22:00',
    close_time: '04:00',
    timezone: 'Asia/Kolkata',
    current_time: now.toISOString(),
  });
});

// Get messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      `SELECT m.id, m.user_id, u.user_id as user_id_str, u.display_name, m.message_text, m.created_at, m.id as sender_id
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.is_approved = true
       ORDER BY m.created_at ASC
       LIMIT 100`
    );

    const messages = result.rows.map(row => ({
      id: row.id,
      sender_id: row.user_id,
      user_id: row.user_id_str,
      display_name: row.display_name,
      message_text: row.message_text,
      created_at: row.created_at,
    }));

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { message_text } = req.body;

    if (!message_text || message_text.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message_text.length > 1000) {
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    const result = await db.query(
      `INSERT INTO chat_messages (user_id, message_text)
       VALUES ($1, $2)
       RETURNING id, created_at`,
      [req.user.id, message_text]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      message_id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;