# 📖 API Documentation

Complete API reference for EduHub Learning Management System.

## Base URL

**Development**: `http://localhost:5000/api`
**Production**: `https://your-lms-api.onrender.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

```
POST /auth/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "student"  // or "instructor"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login

```
POST /auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Get Current User

```
GET /auth/me

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "https://...",
    "bio": "Learning enthusiast"
  }
}
```

### Update Profile

```
PUT /auth/profile

Headers:
Authorization: Bearer <token>

Request Body:
{
  "name": "John Doe",
  "phone": "9876543210",
  "bio": "Passionate about learning",
  "expertise": ["JavaScript", "React"]
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Course Endpoints

### Get All Courses

```
GET /courses?page=1&limit=10&category=Programming&level=Beginner&search=react&sort=-createdAt

Query Parameters:
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)
- category (optional): Filter by category
- level (optional): Filter by level (Beginner, Intermediate, Advanced)
- search (optional): Search keyword
- sort (optional): Sort field (default: -createdAt)

Response:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "React Mastery",
      "description": "Learn React from scratch",
      "category": "Web Development",
      "level": "Beginner",
      "price": 2999,
      "discountPrice": 1999,
      "thumbnail": "https://...",
      "rating": 4.5,
      "totalStudents": 1500,
      "instructor": {
        "name": "Jane Instructor",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Get Course by ID

```
GET /courses/:id

Response:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "React Mastery",
    "description": "Comprehensive React course",
    "category": "Web Development",
    "level": "Beginner",
    "price": 2999,
    "discountPrice": 1999,
    "thumbnail": "https://...",
    "rating": 4.5,
    "totalStudents": 1500,
    "sections": [
      {
        "title": "Introduction",
        "lessons": [
          {
            "id": "lesson1",
            "title": "Getting Started",
            "videoUrl": "https://...",
            "videoDuration": 600
          }
        ]
      }
    ],
    "instructor": { ... },
    "reviews": [ ... ]
  }
}
```

### Create Course (Instructor Only)

```
POST /courses

Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request Body:
{
  "title": "React Mastery",
  "description": "Learn React comprehensively",
  "category": "Web Development",
  "level": "Beginner",
  "price": 2999,
  "thumbnail": <file>,
  "learningOutcomes": ["Learn React", "Build apps"],
  "requirements": ["JavaScript basics"],
  "tags": ["react", "javascript"]
}

Response:
{
  "success": true,
  "message": "Course created successfully",
  "data": { ... }
}
```

### Update Course (Instructor Only)

```
PUT /courses/:id

Headers:
Authorization: Bearer <token>

Request Body:
{
  "title": "Updated Title",
  "price": 3999,
  ...
}

Response:
{
  "success": true,
  "message": "Course updated successfully",
  "data": { ... }
}
```

### Publish Course (Instructor Only)

```
PATCH /courses/:id/publish

Headers:
Authorization: Bearer <token>

Request Body:
{
  "isPublished": true
}

Response:
{
  "success": true,
  "message": "Course published successfully",
  "data": { ... }
}
```

---

## Enrollment Endpoints

### Enroll in Course

```
POST /enrollments/enroll/:courseId

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Enrolled successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "student": "user_id",
    "course": "course_id",
    "enrollmentDate": "2024-01-15",
    "progress": 0,
    "status": "active"
  }
}
```

### Get My Enrollments

```
GET /enrollments/my-courses

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "course": {
        "title": "React Mastery",
        "thumbnail": "https://...",
        "price": 2999
      },
      "progress": 45,
      "status": "active",
      "enrollmentDate": "2024-01-15"
    }
  ]
}
```

### Update Progress

```
PUT /enrollments/:id/progress

Headers:
Authorization: Bearer <token>

Request Body:
{
  "lessonId": "lesson_id",
  "progress": 50
}

Response:
{
  "success": true,
  "message": "Progress updated successfully",
  "data": { ... }
}
```

---

## Quiz Endpoints

### Create Quiz (Instructor Only)

```
POST /quizzes

Headers:
Authorization: Bearer <token>

Request Body:
{
  "courseId": "course_id",
  "title": "React Basics Quiz",
  "description": "Test your React knowledge",
  "questions": [
    {
      "question": "What is React?",
      "type": "multiple-choice",
      "options": ["Library", "Framework", "Language"],
      "correctAnswer": "Library",
      "marks": 1
    }
  ],
  "totalMarks": 10,
  "passingMarks": 60,
  "timeLimit": 30
}

Response:
{
  "success": true,
  "message": "Quiz created successfully",
  "data": { ... }
}
```

### Get Course Quizzes

```
GET /quizzes/course/:courseId

Response:
{
  "success": true,
  "data": [ ... ]
}
```

### Submit Quiz Attempt

```
POST /quizzes/attempts/submit

Headers:
Authorization: Bearer <token>

Request Body:
{
  "quizId": "quiz_id",
  "answers": [
    {
      "questionId": "question_id",
      "answer": "Library"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "marksObtained": 8,
    "totalMarks": 10,
    "percentage": 80,
    "isPassed": true
  }
}
```

---

## Payment Endpoints

### Create Payment Order

```
POST /payments/create-order

Headers:
Authorization: Bearer <token>

Request Body:
{
  "courseId": "course_id"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "order_1234567890",
    "amount": 199900,
    "currency": "INR"
  },
  "paymentId": "payment_id"
}
```

### Verify Payment & Enroll

```
POST /payments/verify

Headers:
Authorization: Bearer <token>

Request Body:
{
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "razorpaySignature": "signature_hash",
  "paymentId": "payment_id"
}

Response:
{
  "success": true,
  "message": "Payment verified and enrollment successful",
  "enrollment": { ... }
}
```

### Get Payment History

```
GET /payments/my-payments

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "payment_id",
      "amount": 1999,
      "course": { "title": "React Mastery" },
      "status": "completed",
      "paidAt": "2024-01-15"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Rate Limits

(To be implemented)

- 1000 requests per hour per IP
- 100 requests per minute for authenticated users
- 10 requests per minute for public endpoints

---

## Webhooks

(Coming soon)

- Course enrollment webhook
- Payment completion webhook
- Quiz submission webhook

---

## Testing API Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Pass123!","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123!"}'

# Get courses
curl -X GET http://localhost:5000/api/courses
```

### Using Postman

1. Import the API collection
2. Set base URL: `http://localhost:5000/api`
3. Add token to Authorization header
4. Test endpoints

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new request
3. Set method, URL, headers
4. Send request

---

## API Rate Limiting

Coming soon - we'll implement intelligent rate limiting to prevent abuse.

---

**Last Updated**: January 2024
**API Version**: v1.0
