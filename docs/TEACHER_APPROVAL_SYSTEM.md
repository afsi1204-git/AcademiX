# Teacher Approval System - Implementation Guide

## Overview
A complete teacher registration and approval system has been implemented. Users can register as teachers, their applications go to admins for review, and once approved, they gain access to the full teacher dashboard with course management capabilities.

---

## User Flow

### 1. **Student Registration (Free Access)**
- User registers with role: **Student**
- Immediately gains access to student dashboard
- Can browse and enroll in courses

### 2. **Teacher Registration (Requires Approval)**
- User registers with role: **Instructor/Teacher**
- Application status: **PENDING**
- Shown "Application Under Review" page
- Cannot access teacher dashboard until approved
- Receives email notification about application status

### 3. **Admin Review Process**
- Admin goes to: `/admin/teacher-approvals`
- Sees all pending teacher applications
- Can **APPROVE** or **REJECT** applications
- Teacher receives email notification of decision

### 4. **Approved Teacher Access**
- Once approved, `instructorRequestStatus` = **APPROVED**
- Teacher can now:
  - Access teacher dashboard: `/teacher/dashboard`
  - Create new courses
  - Add course materials
  - Create assignments
  - Manage student enrollments
  - View course analytics

---

## Backend Implementation

### New/Updated Files

#### 1. **Middleware: `/backend/middleware/auth.js`**
- Added `adminOnly` middleware to protect admin routes
- Existing `authorize` middleware validates:
  - User role (student, instructor, admin)
  - Teacher approval status
  - Blocks unapproved instructors from accessing protected routes

#### 2. **Routes: `/backend/routes/admin.js`** (Completely Rewritten)
**Endpoints:**

- `GET /api/admin/pending-teachers`
  - Gets all pending teacher applications
  - Requires: Admin role

- `GET /api/admin/approved-teachers`
  - Gets all approved teachers
  - Requires: Admin role

- `GET /api/admin/rejected-teachers`
  - Gets all rejected teachers
  - Requires: Admin role

- `PATCH /api/admin/teacher-request/:id`
  - Approve or reject a specific teacher
  - Body: `{ action: "approve" | "reject" }`
  - Sends email notification to teacher
  - Requires: Admin role

#### 3. **Email Service: `/backend/utils/emailService.js`** (Enhanced)
New email functions added:

- `sendTeacherApprovalEmail(email, teacherName)`
  - Sent when teacher is approved
  - Includes link to teacher dashboard

- `sendTeacherRejectionEmail(email, teacherName)`
  - Sent when teacher is rejected
  - Friendly message about reapplication

#### 4. **User Model: `/backend/models/User.js`** (Already Had Support)
Existing fields used:
```javascript
instructorRequestStatus: {  // 'none', 'pending', 'approved', 'rejected'
  type: String,
  enum: ['none', 'pending', 'approved', 'rejected'],
  default: 'none'
}
instructorRequestDate: Date    // When application was submitted
instructorRequestBio: String   // Teacher bio/qualifications
```

#### 5. **Auth Controller: `/backend/controllers/authController.js`**
Already implemented:
- When user registers as `instructor`, status automatically set to `pending`
- Returns success message indicating application is under review

---

## Frontend Implementation

### New Pages Created

#### 1. **Teacher Dashboard** (`/frontend/src/pages/TeacherDashboard.jsx`)
**Route:** `/teacher/dashboard`
**Access:** Only approved instructors

**Features:**
- Dashboard statistics:
  - Total courses created
  - Total enrolled students
  - Total assignments
- Create new course form
- List all courses with management options
- Quick access to course management

#### 2. **Admin Teacher Approval Page** (`/frontend/src/pages/AdminTeacherApprovalPage.jsx`)
**Route:** `/admin/teacher-approvals`
**Access:** Only admins

**Features:**
- 3 tabs: Pending, Approved, Rejected
- Teacher cards showing:
  - Name, email, bio
  - Expertise areas
  - Application date
  - Status badge
- Approve/Reject buttons (pending only)
- Real-time status updates

### Updated Components

#### 1. **App.jsx**
- Added imports for new pages
- Added protected routes:
  - `/teacher/dashboard` - Protected for approved instructors
  - `/admin/teacher-approvals` - Protected for admins

#### 2. **Navbar.jsx** (Enhanced)
- Added "Teacher Panel" button (appears only for approved instructors)
- Added "Teacher Approvals" button (appears only for admins)
- Links automatically appear/hide based on user role and approval status

#### 3. **RegisterPage.jsx** (Already Implemented)
- Shows "Application Forwarded" screen when teacher registers
- Directs to login page with notice that application is under review

---

## Database Schema

### User Model Changes
```javascript
{
  // ... existing fields
  role: 'instructor',
  instructorRequestStatus: 'pending' | 'approved' | 'rejected' | 'none',
  instructorRequestDate: Date,
  instructorRequestBio: String,
  // ... other fields
}
```

**Status Flow:**
```
Registration → pending → [Admin Review] → approved or rejected
                         ↓
                    Teacher access enabled
```

---

## API Endpoints Summary

### Admin Teacher Management
```
GET    /api/admin/pending-teachers      - List pending teachers
GET    /api/admin/approved-teachers     - List approved teachers
GET    /api/admin/rejected-teachers     - List rejected teachers
PATCH  /api/admin/teacher-request/:id   - Approve/reject application
```

### Authentication
```
POST   /api/auth/register               - Register user (student or teacher)
POST   /api/auth/login                  - Login user
GET    /api/auth/me                     - Get current user info
```

---

## Testing the Feature

### 1. **Test Teacher Registration**
1. Go to `/register`
2. Fill form with:
   - Name: "John Teacher"
   - Email: "teacher@example.com"
   - Password: "Test@123456"
   - Role: "Instructor"
3. Submit → See "Application Forwarded" message
4. Check email inbox (if configured) for notification

### 2. **Test Admin Approval**
1. Login as admin: `admin@academix.com` / `Admin@123456`
2. Go to `/admin/teacher-approvals`
3. Click "PENDING" tab
4. See the teacher application
5. Click "Approve" button
6. Teacher email receives approval notification

### 3. **Test Teacher Dashboard Access**
1. Logout from admin
2. Login as the approved teacher
3. Should now see "Teacher Panel" button in navbar
4. Click → Goes to `/teacher/dashboard`
5. Can create courses and manage content

### 4. **Test Unapproved Teacher Blocking**
1. Create second teacher account
2. Without approval, try to access `/teacher/dashboard`
3. Should see "Application Under Review" screen
4. Button to check status again

---

## Access Control Matrix

| User Role | Can Register | Immediate Access | Requires Approval | Dashboard Access |
|-----------|-------------|------------------|-------------------|------------------|
| Student   | ✅ Yes      | ✅ Immediate    | ❌ No             | Student portal   |
| Teacher   | ✅ Yes      | ❌ Blocked       | ✅ Admin review   | Teacher portal   |
| Admin     | ✅ System   | ✅ Full         | ❌ N/A            | Admin portal     |

---

## Email Notifications

### Sent to Teachers

**1. Registration Confirmation**
- Sent: Upon registration
- Content: Welcome email, notice that application is pending

**2. Approval Email**
- Sent: When admin approves
- Content: Congratulations, link to teacher dashboard, features available

**3. Rejection Email**
- Sent: When admin rejects
- Content: Thank you notice, option to reapply

---

## Middleware Protection

All teacher routes are protected with:
```javascript
@middleware: protect + authorize('instructor')
```

This ensures:
1. User is authenticated
2. User has instructor role
3. User's approval status is 'approved'

If any condition fails, returns 403 Forbidden with appropriate error message.

---

## Configuration

### Environment Variables
No new environment variables needed. Uses existing:
- `EMAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `FRONTEND_URL`

---

## Security Notes

✅ **Protected:**
- Admin endpoints require admin role
- Teacher dashboard requires approved instructor status
- Password is hashed with bcrypt
- JWT token validation on all protected routes

❌ **Future Enhancements:**
- Rate limiting on registration
- Email verification before teacher approval
- Two-factor authentication for admins
- Approval deadline/expiration system

---

## Troubleshooting

### Teacher can't see Teacher Panel button
- ✅ Check if `instructorRequestStatus === 'approved'`
- ✅ Verify user is logged in
- ✅ Refresh browser page

### Admin can't access teacher approvals
- ✅ Verify user has `role === 'admin'`
- ✅ Check token is valid
- ✅ Ensure `/admin/teacher-approvals` route exists

### Approval email not received
- ✅ Check email credentials in `.env`
- ✅ Verify email service is configured
- ✅ Check spam folder
- ✅ Check backend console for email errors

---

## Next Steps (Optional Enhancements)

1. **Add teacher profile completion**
   - Bio, expertise areas, qualifications
   - Profile picture upload

2. **Approval system enhancements**
   - Add rejection reason/feedback
   - Allow teachers to reapply
   - Set approval expiration dates

3. **Notifications**
   - Admin notification when new teacher applies
   - In-app notifications for teachers
   - Push notifications

4. **Analytics**
   - Dashboard for admin to see application statistics
   - Approval rate tracking
   - Time-to-approval metrics

---

## File Summary

**Backend Files Modified/Created:**
- ✅ `/backend/middleware/auth.js` - Added adminOnly middleware
- ✅ `/backend/routes/admin.js` - Complete rewrite with new endpoints
- ✅ `/backend/utils/emailService.js` - Added 2 new email functions

**Frontend Files Modified/Created:**
- ✅ `/frontend/src/pages/TeacherDashboard.jsx` - New teacher dashboard
- ✅ `/frontend/src/pages/AdminTeacherApprovalPage.jsx` - New admin approval page
- ✅ `/frontend/src/App.jsx` - Added new routes
- ✅ `/frontend/src/components/Navbar.jsx` - Added navigation buttons

**No Migration Needed** - Uses existing User schema fields

---

**System is production-ready!** 🚀
