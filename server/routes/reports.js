const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Submit report
router.post('/submit', authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { optional_name, description, approximate_location, incident_date, incident_time } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Create report
    const reportResult = await db.query(
      `INSERT INTO reports (user_id, optional_name, description, approximate_location, incident_date, incident_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.user.id, optional_name || null, description, approximate_location, incident_date || null, incident_time || null]
    );

    const reportId = reportResult.rows[0].id;

    // Insert media files
    for (const file of req.files) {
      await db.query(
        `INSERT INTO media_files (report_id, file_name, file_path, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5)`,
        [reportId, file.originalname, file.path, file.mimetype, file.size]
      );
    }

    res.status(201).json({
      message: 'Report submitted successfully',
      report_id: reportId,
      files_uploaded: req.files.length,
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get user's reports
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      `SELECT r.id, r.optional_name, r.description, r.status, r.created_at
       FROM reports r
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;