# 🔐 Security & Best Practices Guide

## Security Measures Implemented

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- Tokens expire after 7 days
- Secure signing with strong secret
- Token stored in localStorage (frontend)
- Authorization header validation

```javascript
// Backend: JWT generation
const token = user.getSignedJwtToken();

// Frontend: Token usage
headers: { Authorization: `Bearer ${token}` }
```

#### Password Security
- Bcryptjs hashing (salt rounds: 10)
- Passwords never stored in plain text
- Password validation on authentication
- Password reset with temporary tokens

### 2. Input Validation & Sanitization

#### Backend Validation
```javascript
// Middleware: mongoSanitize prevents NoSQL injection
app.use(mongoSanitize());

// Input validation
if (!isValidEmail(email)) {
  return res.status(400).json({ message: 'Invalid email' });
}
```

#### Frontend Validation
- Email format validation
- Password strength validation
- Required field checks
- XSS prevention

### 3. CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true 
}));
```

Whitelist specific origins in production.

### 4. Environment Variables

**Never commit `.env` files!**

```bash
# .gitignore should include
.env
.env.local
.env.*.local
```

All sensitive data:
- Database credentials
- API keys
- JWT secret
- Email credentials

### 5. Role-Based Access Control (RBAC)

```javascript
// Middleware: Protect routes based on role
router.post('/courses', protect, authorize('instructor'), createCourse);

// Roles: student, instructor, admin
```

### 6. Data Encryption

- Passwords: bcryptjs
- Tokens: JWT with HS256
- Sensitive URLs: HTTPS only (production)

### 7. Rate Limiting (To Be Implemented)

```bash
npm install express-rate-limit

// Add to middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 8. HTTPS

**Production only:**
- Enforce HTTPS
- Set secure cookies
- Add HSTS headers

```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
});
```

### 9. SQL/NoSQL Injection Prevention

- Mongoose schemas with validation
- Parameterized queries
- Input sanitization
- No string concatenation in queries

### 10. XSS Protection

- React auto-escapes output
- Content Security Policy headers
- DOMPurify for user-generated content

```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Security Checklist for Production

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT_SECRET (>32 characters)
- [ ] Enable MongoDB IP whitelist
- [ ] Set secure email credentials
- [ ] Configure Cloudinary security
- [ ] Use production Razorpay keys
- [ ] Enable CORS for specific domains only
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Set up error logging (don't expose details)
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Dependencies Security

### Check for vulnerabilities

```bash
# Backend
cd backend
npm audit

# Fix vulnerabilities
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

### Keep dependencies updated

```bash
npm update
npm outdated
```

## Best Practices

### 1. Error Handling

**DON'T**:
```javascript
// Bad: Exposes stack trace
res.status(500).json({ error: err.stack });
```

**DO**:
```javascript
// Good: Generic error message
res.status(500).json({ 
  success: false,
  message: 'An error occurred' 
});
// Log detailed error server-side
console.error(err);
```

### 2. Environment Variables

**DON'T**:
```javascript
// Bad: Hardcoded credentials
const dbUrl = 'mongodb+srv://user:password@cluster.mongodb.net/db';
```

**DO**:
```javascript
// Good: Use environment variables
const dbUrl = process.env.MONGODB_URI;
```

### 3. API Security

```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 4. Database Security

- Use strong passwords
- IP whitelist
- Regular backups
- Enable encryption at rest
- Monitor access logs

### 5. Third-party Services

- Keep API keys secure
- Use separate keys for dev/prod
- Monitor API usage
- Implement webhook validation

## Monitoring & Logging

### Backend Logging

```javascript
// Use winston or morgan for logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Frontend Error Tracking

Use Sentry for error tracking:
```bash
npm install @sentry/react

// Initialize
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
});
```

## Compliance

### GDPR Compliance
- [ ] User data privacy policy
- [ ] Consent for data processing
- [ ] Right to access data
- [ ] Right to delete data
- [ ] Data export functionality

### Data Retention
- Delete inactive accounts after 1 year
- Archive old course data
- Delete payment logs after compliance period

## Security Incident Response

### If credentials are compromised:

1. **Immediately rotate credentials**
   ```bash
   # Generate new JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update .env files**
3. **Redeploy immediately**
4. **Notify users if data accessed**
5. **Review logs for unauthorized access**

## Regular Security Maintenance

### Weekly
- [ ] Check npm audit
- [ ] Review error logs

### Monthly
- [ ] Update dependencies
- [ ] Security vulnerability scanning
- [ ] Review access logs

### Quarterly
- [ ] Penetration testing
- [ ] Security audit
- [ ] Backup verification

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Contact Security

For security issues, please email: security@eduhub.com (Do not use GitHub issues for security vulnerabilities)

---

**Security is everyone's responsibility!** 🔒
