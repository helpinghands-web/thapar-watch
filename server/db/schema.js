const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    unique_chat_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX idx_user_id ON users(LOWER(user_id));
  CREATE UNIQUE INDEX idx_chat_id ON users(unique_chat_id);

  -- Reports Table (Media Submissions)
  CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    optional_name VARCHAR(255),
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_sizes BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    description TEXT,
    approximate_location VARCHAR(255),
    incident_date DATE,
    incident_time TIME,
    submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'needs_more_info', 'verified', 'rejected', 'resolved', 'archived')),
    admin_notes TEXT,
    moderation_history JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_reports_status ON reports(status);
  CREATE INDEX idx_reports_created_at ON reports(created_at);
  CREATE INDEX idx_reports_location ON reports(approximate_location);

  -- Chat Messages Table
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
  CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

  -- Chat Reported Messages Table
  CREATE TABLE IF NOT EXISTS reported_messages (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Admin Audit Logs
  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
  CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

  -- Sessions Table
  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

  -- Blocked Users (Chat)
  CREATE TABLE IF NOT EXISTS blocked_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP
  );

  CREATE INDEX idx_blocked_users_user_id ON blocked_users(user_id);

  -- Chat Settings
  CREATE TABLE IF NOT EXISTS chat_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO chat_settings (setting_key, setting_value) VALUES
    ('chat_open_time', '22:00'),
    ('chat_close_time', '04:00'),
    ('chat_timezone', 'Asia/Kolkata'),
    ('message_retention_days', '30')
  ON CONFLICT (setting_key) DO NOTHING;
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🗄️  Initializing database schema...');
    await client.query(schema);
    console.log('✅ Database schema initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database setup complete. You can now start the server.');
    process.exit(0);
  }).catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = { pool, initializeDatabase };
