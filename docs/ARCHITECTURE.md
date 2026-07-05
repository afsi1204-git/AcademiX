# 🔧 Architecture & Technical Design

Comprehensive overview of the EduHub system architecture and technical decisions.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser                          │
│          (React.js + Redux + Tailwind CSS)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│          Vercel (Frontend CDN)                          │
│      (Global edge network, auto-scaling)                │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────┐
│    Render (Backend API Server)                          │
│    (Node.js + Express.js)                               │
│    ├─ Authentication                                    │
│    ├─ Course Management                                │
│    ├─ User Management                                  │
│    ├─ Payment Processing                               │
│    └─ Email Notifications                              │
└──┬──────────────────┬──────────────────┬───────┬────────┘
   │                  │                  │       │
   │                  │                  │       │
   ▼                  ▼                  ▼       ▼
┌──────────┐   ┌──────────┐      ┌──────────┐  ┌─────────┐
│ MongoDB  │   │Cloudinary│      │ Razorpay │  │ Gmail   │
│ (Atlas)  │   │(Videos)  │      │(Payments)│  │(Email)  │
└──────────┘   └──────────┘      └──────────┘  └─────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI library
- **Redux Toolkit**: State management
- **React Router**: Routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Vercel**: Deployment

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **JWT**: Authentication
- **Render**: Deployment

### External Services
- **MongoDB Atlas**: Cloud database
- **Cloudinary**: Video hosting
- **Razorpay**: Payment processing
- **Gmail**: Email notifications

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "instructor" | "admin",
  avatar: String,
  bio: String,
  expertise: [String], // for instructors
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  category: String,
  level: String,
  price: Number,
  thumbnail: String,
  sections: [{
    title: String,
    lessons: [{
      title: String,
      videoUrl: String,
      videoDuration: Number,
      resources: [...]
    }]
  }],
  rating: Number,
  totalStudents: Number,
  isPublished: Boolean,
  createdAt: Date
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  progress: Number, // 0-100
  completedLessons: [{
    lessonId: ObjectId,
    completedAt: Date
  }],
  status: "active" | "completed" | "dropped",
  paymentStatus: "pending" | "completed" | "failed",
  certificateIssued: Boolean,
  createdAt: Date
}
```

## API Design

### RESTful Conventions

```
GET    /api/resource           - List all
POST   /api/resource           - Create new
GET    /api/resource/:id       - Get one
PUT    /api/resource/:id       - Update
DELETE /api/resource/:id       - Delete
PATCH  /api/resource/:id       - Partial update
```

### Response Format

```javascript
// Success
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Error
{
  success: false,
  message: "Error description",
  code: "ERROR_CODE"
}

// With Pagination
{
  success: true,
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    pages: 10
  }
}
```

## Authentication Flow

```
1. User Registration
   └─→ Hash Password → Save to DB → Send verification email

2. Email Verification
   └─→ Click link → Verify token → Mark verified

3. Login
   └─→ Verify credentials → Generate JWT → Return token

4. API Requests
   └─→ Include token in header → Verify → Process

5. Token Expiry
   └─→ 7 days → Request new token via refresh endpoint
```

## Payment Processing Flow

```
1. Student Selects Course
   └─→ Clicks Enroll

2. Create Order
   └─→ POST /api/payments/create-order
   └─→ Razorpay returns order ID
   └─→ Save payment record

3. Payment (Frontend)
   └─→ Open Razorpay checkout
   └─→ Student enters payment info
   └─→ Razorpay processes

4. Verification (Backend)
   └─→ POST /api/payments/verify
   └─→ Verify signature
   └─→ Create enrollment
   └─→ Send confirmation email

5. Certificate (Later)
   └─→ When course completed
   └─→ Generate PDF
   └─→ Send email
```

## State Management

### Redux Structure

```
store/
├── slices/
│   ├── authSlice
│   │   ├── user state
│   │   ├── token
│   │   ├── loading
│   │   └── error
│   ├── courseSlice
│   │   ├── allCourses
│   │   ├── currentCourse
│   │   ├── pagination
│   │   └── loading
│   └── enrollmentSlice
│       ├── myEnrollments
│       └── loading
└── index.js
```

### State Flow

```
User Action
    ↓
Dispatch Async Thunk
    ↓
API Call
    ↓
Update Reducer
    ↓
Component Re-renders
    ↓
UI Updates
```

## Security Architecture

### Layers

1. **Frontend**
   - Input validation
   - XSS prevention
   - Secure token storage

2. **Network**
   - HTTPS/TLS
   - CORS configuration
   - Rate limiting

3. **Backend**
   - JWT verification
   - Password hashing
   - Input sanitization
   - Role-based access

4. **Database**
   - Encryption at rest
   - Backup & recovery
   - Access control

## Scalability Considerations

### Current Architecture
- Handles ~10,000 concurrent users
- 100,000+ total users
- Horizontal scaling on Render
- MongoDB auto-scaling

### Future Improvements
- Redis caching layer
- CDN for static assets
- Database read replicas
- Message queue (Kafka/RabbitMQ)
- Microservices architecture

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- CSS minification
- JavaScript bundling

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Gzip compression

### Database
- Indexes on frequently queried fields
- Aggregation pipelines
- Connection pooling
- Regular maintenance

## Error Handling Strategy

### Frontend
```javascript
try {
  const response = await api.call()
  // Success
} catch (error) {
  // Handle by status code
  // Show user-friendly message
  // Log to error tracking
}
```

### Backend
```javascript
// Middleware catches errors
errorHandler(err, req, res, next) {
  // Normalize error
  // Log details
  // Send safe response
}
```

## Monitoring & Logging

### What We Monitor
- API response times
- Error rates
- Database query times
- User actions
- Payment transactions

### Logging Levels
- ERROR: Critical issues
- WARN: Potential problems
- INFO: User actions
- DEBUG: Detailed info

## Testing Strategy

### Unit Tests
- Controllers
- Models
- Utilities
- Components

### Integration Tests
- API endpoints
- Database operations
- Payment flow

### E2E Tests
- User registration
- Course enrollment
- Payment process
- Certificate generation

---

**Architecture Version**: 1.0
**Last Updated**: January 2024
