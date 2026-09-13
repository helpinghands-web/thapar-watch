# Thapar Watch - Backend API

Express.js backend for Thapar Watch platform.

## Installation

```bash
cd server
npm install
```

## Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret.

## Database Setup

```bash
node db/schema.js
```

This will create all tables and insert the default admin user.

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token

### Reports
- `POST /api/reports/submit` - Submit report with media
- `GET /api/reports/my-reports` - Get user's reports

### Chat
- `GET /api/chat/status` - Get chat status
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message

### Admin
- `GET /api/admin/reports` - Get all reports
- `GET /api/admin/reports/:id` - Get report details
- `PATCH /api/admin/reports/:id` - Update report status
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/deactivate` - Deactivate user
- `GET /api/admin/logs` - Get audit logs

## Default Admin

User ID: `thapar_chronicles_admin`
Password: `Admin@123`

**Change this password immediately in production!**
