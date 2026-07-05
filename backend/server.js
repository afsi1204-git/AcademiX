const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Ensure environment variable paths resolve relative to the server script execution home
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Global Middleware Configuration Suite
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' })); // Customize this array link context for strict security in production
app.use(mongoSanitize());
app.use(compression());
app.use(fileUpload({ useTempFiles: true, tempFileDir: os.tmpdir() }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB and execute baseline system account seeding configurations
connectDB()
  .then(() => {
    ensureAdminExists();
  })
  .catch((error) => {
    console.warn(`[DATABASE WARN] Continuing without a live MongoDB connection: ${error.message}`);
  });

/**
 * Validates, enforces, and seeds the master system admin profile credentials safely on boot
 */
async function ensureAdminExists() {
  const User = require('./models/User');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eduhub.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  try {
    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true
      });
      console.log(`[SEED] System administrative master user initialized successfully: ${admin.email}`);
    } else {
      const isPasswordCurrent = await admin.matchPassword(adminPassword);
      if (!isPasswordCurrent) {
        admin.password = adminPassword;
        await admin.save();
      }
      console.log(`[SEED] Active administrator routing structure verified: ${admin.email}`);
    }
  } catch (error) {
    console.error(`[SEED ERROR] Administrative security seeding failure: ${error.message}`);
  }
}

// REST API Resource Endpoint Route Map Routing Pipeline Links
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/admin', require('./routes/admin'));

// Platform API Health Check Diagnostics Validation Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date(),
  });
});

// Centralized Fallback 404 Route Handler Interceptor
app.use((req, res) => {
  console.warn(`[404 NOT FOUND] Mismatched Route Target: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found on this server infrastructure layout',
  });
});

// Centralized Global Express Exception Interception Pipeline Middleware
app.use(errorHandler);

// Instantiate Active Express Application Listening Instance Port Gateway
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment Workspace Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled asynchronous promise rejection tracking cleanly
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection Error: ${err.message}`);
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

// Graceful application environment resource teardown closure interceptor mapping
process.on('SIGTERM', () => {
  console.log('SIGTERM termination command captured. Spinning down runtime listeners cleanly.');
  server.close(() => {
    console.log('Backend processing engine structural threads stopped.');
  });
});
