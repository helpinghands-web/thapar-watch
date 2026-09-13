# Thapar Watch

**Capture Campus Moments. Share Your Story.**

A modern, secure, privacy-focused platform for Thapar Institute of Engineering and Technology students and visitors to submit photos and videos of campus incidents, activities, and moments.

## Features

✅ **Easy Media Upload** - Upload photos and videos directly from your device, camera, or Google Photos  
✅ **Privacy First** - Optional name submission, no email or phone required  
✅ **Secure Admin Dashboard** - Administrators review all submissions privately  
✅ **Community Chatroom** - Real-time chat for Thaparians (10 PM - 4 AM IST daily)  
✅ **Secure Authentication** - User ID & password login with encryption  
✅ **Responsive Design** - Beautiful interface on mobile, tablet, and desktop  
✅ **Dark & Light Modes** - Choose your preferred theme  
✅ **Enterprise Security** - OWASP best practices, HTTPS, rate limiting, input validation  

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Argon2id Password Hashing
- **Storage**: Secure private file storage
- **Security**: Helmet, CORS, Rate Limiting, CSRF Protection

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/helpinghands-web/thapar-watch.git
cd thapar-watch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Initialize the database:
```bash
node server/db/schema.js
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Admin Account

**User ID**: `Thapar_chronicles_28`  
**Password**: Set this securely in your `.env` file before deployment

⚠️ **IMPORTANT**: Change the default admin password before deploying to production.

## Security

- All uploaded media is private and only accessible by authorized administrators
- Passwords are hashed using Argon2id
- JWT tokens secure all API endpoints
- Rate limiting prevents abuse
- HTTPS enforced in production
- No hardcoded credentials in source code

## Database Schema

See `server/db/schema.js` for complete schema details.

## Deployment

Before deployment, ensure:
1. All environment variables are configured securely
2. Database backups are enabled
3. HTTPS is enforced
4. Admin credentials are changed
5. Security audit is completed

## License

MIT

## Support

For issues and questions, please contact the platform administrator.
