# Thapar Watch - Campus Reporting Platform

**Your campus. Your voice. Your responsibility.**

Thapar Watch is a secure, anonymous platform for reporting campus incidents at Thapar Institute. Submit photos and videos directly, engage in moderated community chat, and help make campus safer.

## ⚠️ IMPORTANT DISCLAIMER

**This platform is INDEPENDENT and NOT OFFICIALLY AFFILIATED with Thapar Institute.** Thapar Watch operates as a community-run reporting platform. Any official affiliation, endorsement, or integration with Thapar Institute requires formal written authorization.

## 📋 Content Sharing & Publication Policy

**IMPORTANT:** When you submit media (photos or videos) to Thapar Watch:

1. **Admin Review** - Submitted content is reviewed by administrators for legitimacy and appropriateness
2. **Potential Publication** - If your submission is **approved by administrators**, your media **MAY BE PUBLISHED on the official Thapar Chronicles channel** or other appropriate institutional channels
3. **Attribution** - Your submission may be credited to you (if you provided your name) or published anonymously based on your preference
4. **No Guarantee** - Not all submissions will be published. The decision rests entirely with administrators based on relevance and institutional guidelines
5. **Legal Compliance** - All published content must comply with applicable laws and institutional policies

**By submitting content, you acknowledge and agree that approved submissions may be shared publicly on official channels.**

## 🚀 Features

- **Easy Media Uploads** - Submit photos and videos in seconds
- **Complete Privacy** - Optional name submission, no email or phone required
- **Secure Storage** - Media stored privately, accessible only to administrators
- **Community Chat** - Connect with Thaparians nightly (10 PM - 4 AM IST)
- **Admin Dashboard** - Comprehensive tools for managing reports and users
- **Dark Mode** - Built-in dark theme support
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **AWS S3** - Media storage (optional)
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- AWS S3 bucket (optional, for production)
- Environment variables configured

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/helpinghands-web/thapar-watch.git
cd thapar-watch
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/thapar_watch

# JWT
JWT_SECRET=your_secret_key_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Node environment
NODE_ENV=development
PORT=3001

# AWS S3 (optional)
AWS_S3_BUCKET=your_bucket_name
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 4. Setup database

```bash
# Create PostgreSQL database
createdb thapar_watch

# Run migrations (automated on server start)
```

### 5. Start development servers

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
thapar-watch/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── stores/            # Zustand stores
│   ├── upload/            # Upload page
│   ├── chat/              # Chat page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── privacy/           # Privacy policy
│   └── admin/             # Admin pages
├── components/            # Reusable React components
├── server/                # Express backend
│   ├── index.js          # Server entry point
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   ├── db/               # Database setup
│   └── services/         # Business logic
├── public/               # Static assets
├── .env.local           # Environment variables (local)
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies
```

## 🔐 Privacy & Security

- **No Personal Data Required** - Submit anonymously
- **Encrypted Storage** - Media stored securely
- **Access Control** - Only authorized admins can view submissions
- **Private by Default** - Submissions are private until reviewed and approved for publication
- **Password Hashing** - bcryptjs for secure passwords
- **JWT Authentication** - Secure token-based auth

## ⚠️ Critical Disclaimers

### This is NOT an Emergency Service
**If someone is in immediate danger, contact campus security or appropriate emergency services directly.** Do not rely on Thapar Watch for emergency situations.

### Platform Independence
Thapar Watch is an independent community platform. It is **NOT an official channel of Thapar Institute**. Any integration with official institutional channels depends on administrative approval and discretion.

### Content Publication
By submitting content, you understand and agree that:
- Your submission may be reviewed and approved for publication on official channels
- Published content may appear on Thapar Chronicles or other institutional platforms
- The decision to publish rests entirely with administrators
- Once published, content may be viewed by the entire institutional community
- You retain responsibility for the accuracy and appropriateness of submitted content

### Responsible Reporting Guidelines

✅ **DO:**
- Report genuine campus safety concerns
- Provide accurate information
- Respect privacy of all individuals
- Use for legitimate reporting purposes
- Understand your content may be published if approved

❌ **DON'T:**
- Submit false or fabricated content
- Record people in private situations without consent
- Share private information to expose individuals
- Encourage vigilantism or confrontation
- Use for harassment or bullying
- Submit content you don't have rights to share

## 🤝 Contributing

This is an educational platform. For improvements or issues:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or issues, contact: admin@thaparwatch.local

## ⚖️ License

This project is licensed under the MIT License - see LICENSE file for details.

## 📢 Legal Notice

**THIS PLATFORM IS INDEPENDENT AND NOT OFFICIALLY AFFILIATED WITH THAPAR INSTITUTE.** 

Users are solely responsible for their submissions and must comply with all applicable laws and institutional policies. Thapar Institute is not liable for user-generated content, misuse of this platform, or any consequences arising from submissions made through Thapar Watch.

**Content Submission Acknowledgment:** By uploading content to this platform, you acknowledge that approved submissions may be published on Thapar Chronicles official channel or other institutional platforms at the discretion of administrators.

---

**Made with ❤️ for campus accountability and safety**
