# ⚡ Quick Start Guide

Get EduHub running in 5 minutes!

## Prerequisites Check

```bash
# Verify Node.js (should be v16+)
node --version

# Verify npm
npm --version
```

## Quick Start

### 1️⃣ Setup Backend (Terminal 1)

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB URI from MongoDB Atlas
# - JWT secret
# - Email credentials
# - Cloudinary keys
# - Razorpay keys

# Install and run
npm install
npm run dev

# Output should show: "Server running on port 5000"
```

### 2️⃣ Setup Frontend (Terminal 2)

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env:
# REACT_APP_API_URL=http://localhost:5000/api

# Install and run
npm install
npm start

# Browser should open at http://localhost:3000
```

## Test the App

### Create Test Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill details:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123456
   - Role: Student
4. Click "Sign Up"

### Test Features

```
✅ Login with created account
✅ Browse courses
✅ Create course (as instructor)
✅ Enroll in course
✅ View progress
```

## API Health Check

```bash
curl http://localhost:5000/api/health

# Should return:
# {
#   "success": true,
#   "message": "Server is running"
# }
```

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Backend won't start | Check .env file, verify MongoDB URI |
| Frontend blank page | Check REACT_APP_API_URL in .env |
| Can't login | Verify email/password, check backend logs |
| Images not loading | Verify Cloudinary credentials |

## Next Steps

1. **Configure Services**
   - [ ] MongoDB Atlas setup
   - [ ] Cloudinary account
   - [ ] Razorpay account
   - [ ] Gmail App Password

2. **Development**
   - [ ] Create sample courses
   - [ ] Test enrollment flow
   - [ ] Test quiz functionality
   - [ ] Test payments (test mode)

3. **Deployment**
   - [ ] Push to GitHub
   - [ ] Deploy backend to Render
   - [ ] Deploy frontend to Vercel
   - [ ] Configure custom domain

## Useful Commands

```bash
# Backend
npm run dev          # Start dev server
npm test            # Run tests
npm run build       # Build for production

# Frontend
npm start           # Start dev server
npm test            # Run tests
npm run build       # Build for production

# Database
# MongoDB shell: mongosh
# Connect to your MongoDB
```

## Documentation

- 📖 [Full README](./README.md)
- 🔐 [Security Guide](./docs/SECURITY.md)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
- 📚 [API Documentation](./docs/API.md)
- 🛠️ [Troubleshooting](./docs/TROUBLESHOOTING.md)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md)

---

**🎉 You're all set! Happy coding!**
