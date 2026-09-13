const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { pool, initializeDatabase } = require('./db/schema');
const { verifyToken, verifyAdmin } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const { router: auditRoutes } = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: 'Invalid file type. Only images and videos allowed.' });
  }
  
  if (err.status === 413) {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Initialize schema
    await initializeDatabase();
    console.log('✅ Database schema initialized');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📝 API endpoints:');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('  - POST /api/reports/submit');
      console.log('  - GET /api/reports (admin)');
      console.log('  - GET /api/chat/status');
      console.log('  - POST /api/chat/messages');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
