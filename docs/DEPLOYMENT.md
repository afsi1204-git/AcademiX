# 🚀 Deployment Guide

Complete step-by-step guide to deploy EduHub to production.

## Table of Contents

1. [Vercel Frontend Deployment](#vercel-frontend-deployment)
2. [Render Backend Deployment](#render-backend-deployment)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Custom Domain Setup](#custom-domain-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Vercel Frontend Deployment

### Step 1: Prepare Your Code

1. Make sure all changes are committed
2. Push to GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select your LMS repository
3. Click "Import"

### Step 4: Configure Environment

1. Before importing, go to "Environment Variables"
2. Add the following:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_RAZORPAY_KEY_ID=your_key_id
```

3. Click "Deploy"

### Step 5: Custom Build Settings (if needed)

1. Go to Project Settings
2. Build & Development Settings:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

### Step 6: Deploy

- Vercel will automatically deploy
- You'll get a live URL like: `your-lms.vercel.app`

### Step 7: Configure Production Environment

1. Go to Settings → Environment Variables
2. Update `REACT_APP_API_URL` to your production backend

**Important**: Every push to main will auto-deploy!

---

## Render Backend Deployment

### Step 1: Prepare Backend

1. Ensure `package.json` has correct start command

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

2. Make sure `.env` is in `.gitignore`
3. Commit and push to GitHub

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize access

### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Select your repository
3. Click "Connect"

### Step 4: Configure Service

Fill in the following:

```
Name: lms-api
Region: Singapore (or closest to your users)
Runtime: Node
Branch: main
Build Command: npm install
Start Command: npm start
```

### Step 5: Add Environment Variables

1. Go to "Environment"
2. Add all variables from `.env`:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/academix
JWT_SECRET=your_very_secret_key
FRONTEND_URL=https://your-lms.vercel.app
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@eduhub.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Step 6: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy
3. Get your backend URL: `your-lms-api.onrender.com`

### Step 7: Update Frontend

1. Go to Vercel project settings
2. Update `REACT_APP_API_URL` to your Render backend URL
3. Trigger redeploy

---

## MongoDB Atlas Setup

### Step 1: Create Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create organization and project

### Step 2: Create Cluster

1. Click "Create" → "Build a cluster"
2. Choose free tier
3. Select region (closest to your users)
4. Click "Create Cluster"

### Step 3: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Save credentials securely

### Step 4: Configure IP Whitelist

1. Go to "Network Access"
2. Click "Add IP Address"
3. For production: Add Render's static IP
4. Or click "Allow Access from Anywhere" (less secure)

### Step 5: Get Connection String

1. Go to "Clusters"
2. Click "Connect"
3. Choose "Drivers"
4. Select "Node.js"
5. Copy connection string
6. Replace `<username>` and `<password>` with your credentials
7. Add to Render environment variables as `MONGODB_URI`

### Step 6: Enable Encryption

1. Go to Cluster → "Security"
2. Enable "Encryption at Rest"
3. Enable "Backup"

---

## Custom Domain Setup

### Using Vercel Domain

1. Go to Vercel project settings
2. Domains section
3. Add your custom domain
4. Follow DNS instructions

### Using Render Domain

1. Go to Render service settings
2. Add custom domain
3. Update DNS records with provided values

### DNS Configuration

Typically, you'll need to add:

```
CNAME: www → your-app.vercel.app
CNAME: api → your-api.onrender.com
A Record: @ → IP address provided
```

Add these in your domain provider's DNS settings.

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Backend
        run: cd backend && npm install
      
      - name: Test Backend
        run: cd backend && npm test
      
      - name: Install Frontend
        run: cd frontend && npm install
      
      - name: Test Frontend
        run: cd frontend && npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
      
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_WEBHOOK }}
```

---

## Monitoring & Maintenance

### Set Up Error Tracking

Use Sentry for error monitoring:

```bash
# Backend
npm install @sentry/node

# Frontend
npm install @sentry/react
```

Initialize in your code:

```javascript
// Backend
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Frontend
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });
```

### Monitoring Dashboard

1. **Vercel Analytics**: https://vercel.com/analytics
2. **Render Metrics**: In service dashboard
3. **MongoDB Atlas**: In cluster dashboard
4. **Sentry**: Real-time error tracking

### Regular Maintenance

#### Weekly
- [ ] Check error logs
- [ ] Monitor database performance
- [ ] Review API response times

#### Monthly
- [ ] Update dependencies
- [ ] Security vulnerability scan
- [ ] Backup verification
- [ ] Cost review

#### Quarterly
- [ ] Performance optimization
- [ ] Database cleanup
- [ ] Security audit

### Database Backups

MongoDB Atlas automatically backs up daily. To restore:

1. Go to MongoDB Atlas
2. Cluster → Backup
3. Select backup point
4. Click "Restore"

### Log Monitoring

```bash
# Backend logs on Render
# View in service logs tab

# Frontend errors in Sentry
# https://sentry.io/dashboard
```

---

## Production Checklist

- [ ] Backend running on Render
- [ ] Frontend deployed on Vercel
- [ ] Database on MongoDB Atlas
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Email service working
- [ ] Payment gateway tested
- [ ] Cloudinary images loading
- [ ] Analytics dashboard set up
- [ ] Error tracking enabled
- [ ] Backups scheduled
- [ ] CDN configured (optional)
- [ ] Rate limiting enabled
- [ ] CORS configured for production

---

## Scaling for Growth

### As Your Users Grow

1. **Upgrade MongoDB**: Increase cluster tier
2. **Scale Render**: Upgrade plan or use multiple instances
3. **CDN for Assets**: Cloudinary + Vercel Edge
4. **Database Optimization**: Add indexes, optimize queries
5. **Caching**: Implement Redis (coming soon)

---

## Troubleshooting

### Backend not starting

```bash
# Check logs in Render
# Verify all environment variables
# Check Node version compatibility
```

### Frontend not connecting

```bash
# Check REACT_APP_API_URL
# Verify backend is running
# Check browser console for errors
# Clear cache and reload
```

### Database connection error

```bash
# Verify MONGODB_URI
# Check IP whitelist in MongoDB Atlas
# Verify database user credentials
# Check network connectivity
```

### Email not sending

```bash
# Enable "Less secure apps" in Gmail
# Or use App Password
# Verify EMAIL_PASSWORD in environment
```

---

## Support

For deployment issues:
1. Check service logs
2. Review error messages
3. Contact support team

**Render Support**: https://support.render.com
**Vercel Support**: https://vercel.com/support
**MongoDB Support**: https://www.mongodb.com/support

---

**Deployment Complete! 🎉**

Your LMS is now live and ready for users!
