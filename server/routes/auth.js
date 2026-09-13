const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/schema');
const { loginLimiter } = require('../middleware/auth');
const crypto = require('crypto');

// Register new user
router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { user_id, password, password_confirm, display_name } = req.body;

    // Validation
    if (!user_id || !password || !display_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== password_confirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user_id already exists (case-insensitive)
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(user_id) = LOWER($1)',
      [user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This User ID is already taken. Please choose another one.' });
    }

    // Hash password with Argon2
    const password_hash = await argon2.hash(password);

    // Generate unique chat ID
    const unique_chat_id = `USER_${crypto.randomBytes(16).toString('hex')}`;

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (unique_chat_id, user_id, display_name, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, display_name',
      [unique_chat_id, user_id, display_name, password_hash, 'user']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        display_name: user.display_name,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ error: 'User ID and password required' });
    }

    // Find user by user_id (case-insensitive)
    const result = await pool.query(
      'SELECT id, user_id, display_name, password_hash, role, account_status FROM users WHERE LOWER(user_id) = LOWER($1)',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect User ID or password.' });
    }

    const user = result.rows[0];

    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended or deleted.' });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password_hash, password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect User ID or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
