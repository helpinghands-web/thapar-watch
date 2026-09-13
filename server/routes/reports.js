const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { pool } = require('../db/schema');
const { verifyAdmin, uploadLimiter } = require('../middleware/auth');

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
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
    cb(new Error('Invalid file type. Only images and videos allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024,
  },
});

// Submit a report (public endpoint)
router.post('/submit', uploadLimiter, async (req, res) => {
  try {
    // Handle multiple file uploads
    const uploadHandler = upload.array('media', 5);

    uploadHandler(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { optional_name, description, approximate_location, incident_date, incident_time } = req.body;

        // Validate at least one file was uploaded
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'At least one photo or video is required' });
        }

        // Extract file information
        const media_urls = req.files.map((file) => path.join(uploadDir, file.filename));
        const media_types = req.files.map((file) => file.mimetype);
        const media_sizes = req.files.map((file) => file.size);

        // Insert report into database
        const result = await pool.query(
          `INSERT INTO reports (
            optional_name, media_urls, media_types, media_sizes,
            description, approximate_location, incident_date, incident_time,
            status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, submission_timestamp`,
          [
            optional_name || null,
            media_urls,
            media_types,
            media_sizes,
            description || null,
            approximate_location || null,
            incident_date || null,
            incident_time || null,
            'new',
          ]
        );

        const report = result.rows[0];

        res.status(201).json({
          message: 'Your submission has been received. Thank you for helping bring attention to campus concerns responsibly.',
          report_id: report.id,
          submitted_at: report.submission_timestamp,
        });
      } catch (dbErr) {
        console.error('Database error:', dbErr);
        res.status(500).json({ error: 'Failed to save report' });
      }
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Get all reports (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, location, sort } = req.query;
    let query = 'SELECT id, optional_name, description, approximate_location, incident_date, incident_time, submission_timestamp, status, created_at FROM reports WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    if (location) {
      query += ' AND approximate_location ILIKE $' + (params.length + 1);
      params.push(`%${location}%`);
    }

    query += ' ORDER BY ';
    if (sort === 'status') {
      query += 'status DESC';
    } else if (sort === 'location') {
      query += 'approximate_location ASC';
    } else {
      query += 'submission_timestamp DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report with media (admin only)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch report error:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Download media (admin only)
router.get('/:id/download/:fileIndex', verifyAdmin, async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    const result = await pool.query('SELECT media_urls FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const media_urls = result.rows[0].media_urls;
    const fileIdx = parseInt(fileIndex);

    if (fileIdx < 0 || fileIdx >= media_urls.length) {
      return res.status(400).json({ error: 'Invalid file index' });
    }

    const filePath = media_urls[fileIdx];
    res.download(filePath);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Update report status (admin only)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['new', 'under_review', 'needs_more_info', 'verified', 'rejected', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE reports SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, admin_notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete report (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT media_urls FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete files
    const media_urls = result.rows[0].media_urls || [];
    for (const filePath of media_urls) {
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.warn(`Could not delete file: ${filePath}`);
      }
    }

    // Delete report from database
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router;
