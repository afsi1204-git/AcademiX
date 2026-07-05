# 🐛 Troubleshooting Guide

Common issues and solutions for EduHub LMS.

## Backend Issues

### Issue: Backend won't start

**Error**: `Port 5000 already in use`

**Solution 1**: Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Solution 2**: Use a different port
```bash
# Change PORT in .env
PORT=5001
npm run dev
```

---

### Issue: Cannot connect to MongoDB

**Error**: `MongoNetworkError: getaddrinfo ENOTFOUND cluster.mongodb.net`

**Solution 1**: Check connection string
```bash
# Verify MONGODB_URI in .env
MONGODB_URI=mongodb://127.0.0.1:27017/academix
```

**Solution 2**: IP Whitelist
1. Go to MongoDB Atlas
2. Network Access
3. Add your IP or "Allow Access from Anywhere"

**Solution 3**: Network issues
```bash
# Check connectivity
ping cluster.mongodb.net

# If using VPN, disable it temporarily
```

---

### Issue: Missing environment variables

**Error**: `Cannot read property 'split' of undefined`

**Solution**: Create and fill `.env` file
```bash
cp .env.example .env
# Fill all required variables
```

---

### Issue: JWT authentication failing

**Error**: `JsonWebTokenError: invalid token`

**Solution 1**: Check token expiry
```bash
# Update JWT_EXPIRE in .env
JWT_EXPIRE=7d

# Restart backend
npm run dev
```

**Solution 2**: Regenerate JWT secret
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
JWT_SECRET=your_new_secret
```

---

### Issue: Email not sending

**Error**: `Error: Invalid login: 535-5.7.8 Username and password not accepted`

**Solution 1**: Enable Less Secure Apps (Gmail)
1. Go to https://myaccount.google.com/lesssecureapps
2. Enable "Less secure app access"

**Solution 2**: Use App Password (Recommended)
1. Enable 2-Factor Authentication
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password
4. Use generated password in EMAIL_PASSWORD

**Solution 3**: Use different email service
```bash
# Update .env
EMAIL_SERVICE=your_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```

---

### Issue: Cloudinary upload failing

**Error**: `Error: Invalid Credentials`

**Solution**: Verify Cloudinary credentials
1. Go to https://cloudinary.com/console
2. Copy Cloud Name, API Key, API Secret
3. Update `.env`:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### Issue: CORS errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Check CORS configuration
```javascript
// In server.js
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true 
}));
```

Update `.env`:
```bash
FRONTEND_URL=http://localhost:3000
```

---

## Frontend Issues

### Issue: Cannot connect to backend

**Error**: `API request failed` or `Network Error`

**Solution 1**: Check backend URL
```bash
# In .env
REACT_APP_API_URL=http://localhost:5000/api
```

**Solution 2**: Verify backend is running
```bash
# Check if backend is started
curl http://localhost:5000/api/health

# If not running
cd backend
npm run dev
```

**Solution 3**: Check CORS settings
- Backend should have CORS enabled
- Frontend URL should be whitelisted

---

### Issue: Blank white page

**Error**: Nothing loads in browser

**Solution 1**: Check browser console for errors
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for JavaScript errors

**Solution 2**: Clear cache and reload
```bash
# Hard refresh
Ctrl+Shift+R  # Windows/Linux
Cmd+Shift+R   # macOS
```

**Solution 3**: Rebuild frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

### Issue: Redux state not updating

**Error**: Component not re-rendering after action

**Solution**: Check Redux DevTools
1. Install Redux DevTools extension
2. Check state in DevTools
3. Verify actions are dispatched
4. Check reducers are correct

---

### Issue: API calls returning 401

**Error**: `Not authorized to access this route`

**Solution 1**: Check token storage
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));
```

**Solution 2**: Verify token in headers
```javascript
// In apiClient.js
Authorization: `Bearer ${token}`
```

**Solution 3**: Token expired
- Login again to get new token

---

### Issue: Images not loading

**Error**: Images showing 404 or broken image icon

**Solution 1**: Check image URL
```bash
# Verify Cloudinary URL is correct
# Try direct URL in browser
```

**Solution 2**: Cloudinary credentials
- Verify CLOUDINARY_CLOUD_NAME is correct
- Check if images uploaded successfully

---

## General Issues

### Issue: Application very slow

**Solutions**:
1. Check network tab in DevTools - identify slow requests
2. Enable gzip compression in backend
3. Optimize database queries
4. Add pagination to large lists
5. Lazy load images
6. Cache API responses

---

### Issue: File upload failing

**Error**: `File upload error`

**Solution 1**: Check file size
```bash
# In backend
# Default max file size: 50MB
express.json({ limit: '50mb' })
```

**Solution 2**: Check file type
```bash
# Ensure correct MIME types
# Video: video/mp4, video/webm
# Image: image/jpeg, image/png
```

---

### Issue: Database running out of space

**Error**: `Write concern warning: Storage space low`

**Solution**:
1. Go to MongoDB Atlas
2. Upgrade cluster tier
3. Or delete old backups/logs
4. Implement data archiving

---

### Issue: High memory usage

**Error**: Application running slowly or crashing

**Solutions**:
1. Check for memory leaks in code
2. Implement pagination
3. Clear old logs
4. Reduce database result sets
5. Use caching (Redis)

---

## Production Issues

### Issue: Backend crashes on Render

**Solution**:
1. Check Render logs
2. Verify all environment variables
3. Check database connection
4. Monitor memory/CPU usage
5. Restart service

---

### Issue: Frontend not updating on Vercel

**Solution**:
1. Verify pushed to GitHub
2. Check build logs in Vercel
3. Clear cache and redeploy
4. Check environment variables

---

### Issue: Emails not sending in production

**Solution**:
1. Use Gmail App Password (not regular password)
2. Enable SMTP in email provider
3. Check email logs
4. Verify email credentials

---

## Debugging Tips

### Enable Debug Mode

**Backend**:
```bash
DEBUG=* npm run dev
```

**Frontend**:
```bash
DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
```

### Use Browser DevTools

1. **Console**: Check for JavaScript errors
2. **Network**: Monitor API requests
3. **Storage**: Check localStorage/cookies
4. **Lighthouse**: Performance audit

### Server Logs

**Backend**:
```bash
# Check console output
tail -f backend.log

# On Render
# Logs tab in service dashboard
```

**Frontend**:
```bash
# Browser DevTools Console
# Vercel Analytics
```

---

## Getting Help

1. **Check Documentation**: Read docs/ files
2. **Search Issues**: GitHub issues
3. **Check Logs**: Console and server logs
4. **Use Debugger**: Browser DevTools
5. **Contact Support**: Email support team

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Login or provide token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check resource exists |
| 500 | Server Error | Check backend logs |
| 503 | Unavailable | Backend or DB down |

---

**Still stuck?** Contact us or open an issue on GitHub! 🆘
