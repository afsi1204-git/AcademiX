# Academix LMS - Complete Workflow Guide

## Part 1: Registration & Authentication Flow

### Student Registration (Immediate Access)

**Step 1: Access Registration Page**
```
URL: http://localhost:3000/register
```

**Step 2: Fill Registration Form**
```
Name:     John Student
Email:    student@example.com
Password: Test@123456
Role:     Student ← SELECT THIS
```

**Step 3: Submit**
- ✅ Account created immediately
- ✅ Automatic login (token generated)
- ✅ Redirected to student dashboard: `/student/my-courses`

**Result:** Students get instant access to:
- Course catalog
- Course enrollment
- Student dashboard

---

### Instructor Registration (Approval Required)

**Step 1: Access Registration Page**
```
URL: http://localhost:3000/register
```

**Step 2: Fill Registration Form**
```
Name:     Alice Teacher
Email:    teacher@example.com
Password: Test@123456
Role:     Instructor ← SELECT THIS
```

**Step 3: Submit**
- ⏳ Application status = "pending"
- 🔒 Blocked from instructor features
- 👁️ See "Application Under Review" screen

**What Happens Behind the Scenes:**
```javascript
// In backend:
User.create({
  name: "Alice Teacher",
  email: "teacher@example.com",
  role: "instructor",
  instructorRequestStatus: "pending",  // ← Key field
  instructorRequestDate: new Date()
})

// Email sent to teacher:
"Your registration has been forwarded to admin for review"
```

**Result:** Teachers must wait for admin approval

---

## Part 2: Administrator Functionalities

### Admin Login

**Credentials:**
```
Email:    admin@academix.com
Password: Admin@123456
```

**Access Admin Panel:**
```
URL: http://localhost:3000/admin/dashboard
```

---

### 2.1 Instructor Request Validation

**Access Teacher Approvals:**
```
URL: http://localhost:3000/admin/teacher-approvals
```

**You Will See:**
```
📋 Three Tabs:
├─ Pending (new applications)
├─ Approved (accepted teachers)
└─ Rejected (rejected applications)
```

**To Approve a Teacher:**

1. Click "PENDING" tab
2. Find the teacher application card showing:
   ```
   Name:         Alice Teacher
   Email:        teacher@example.com
   Status:       PENDING
   Applied On:   [Date]
   ```
3. Click **"APPROVE"** button
   - Teacher's `instructorRequestStatus` changes to "approved"
   - Email sent: "Your teacher account is approved!"
   - Moves to "APPROVED" tab

**To Reject a Teacher:**

1. Click "PENDING" tab
2. Find teacher application
3. Click **"REJECT"** button
   - Teacher's status changes to "rejected"
   - Email sent: "Your application was not approved at this time"
   - Moves to "REJECTED" tab

**Database Change:**
```javascript
// Before:
{
  _id: ObjectId(...),
  name: "Alice Teacher",
  instructorRequestStatus: "pending"
}

// After Approval:
{
  _id: ObjectId(...),
  name: "Alice Teacher",
  instructorRequestStatus: "approved"  // ← CHANGED
}
```

---

### 2.2 Direct Faculty Provisioning

**Admin Can Manually Create Instructor Accounts**

**Steps:**
1. In Admin Dashboard, look for "Add New Instructor" button
2. Fill form:
   ```
   Name:     Bob Instructor
   Email:    bob@example.com
   Password: SecurePass123
   ```
3. Submit
   - Instructor account created with status = "approved" (bypasses queue)
   - Instructor can immediately access teacher dashboard
   - Email sent: "Your instructor account is ready"

---

### 2.3 Global Course Catalog Inventory

**View All Courses in System:**
```
URL: http://localhost:3000/admin/dashboard
Section: Course Management → All Courses
```

**You Will See:**
```
All courses created by all instructors:
├─ Course Name
├─ Instructor Name
├─ Student Count
├─ Price
└─ Status (Published/Draft)
```

**Admin Actions on Courses:**
- View course details
- Edit course settings
- Delete course if needed
- View course analytics
- Track enrollments

---

### 2.4 Administrative Task Dispatcher

**Send Task to All Instructors:**

1. Go to Admin Dashboard
2. Click "Broadcast Tasks"
3. Create new task:
   ```
   Title: "Update Your Course Materials"
   Message: "Please ensure all course materials are current"
   Recipients: All Instructors
   ```
4. Send
   - All instructors see notification in navbar (🔔 icon)
   - Notification appears in task list
   - Marked as unread until clicked

**Send Task to Specific Instructor:**

1. Go to Admin Dashboard → Instructor Management
2. Find instructor (e.g., "Alice Teacher")
3. Click "Send Task"
4. Create task:
   ```
   Title: "Review Student Submissions"
   Message: "You have pending assignments to grade"
   Recipient: Alice Teacher (specific)
   ```
5. Send
   - Only Alice sees this notification
   - Task shows in her navbar

---

### 2.5 Accountability System Logs

**View System Audit Log:**
```
URL: http://localhost:3000/admin/dashboard
Section: System → Audit Logs
```

**Log Shows:**
```
Timestamp          | Action                    | User          | Details
─────────────────┼──────────────────────────┼───────────────┼─────────
2026-06-25 10:00 | Teacher Approved         | admin@email   | Alice Teacher
2026-06-25 09:45 | Course Created           | alice@email   | "Web Dev 101"
2026-06-25 09:30 | Student Enrolled         | john@email    | Enrolled in "Web Dev 101"
2026-06-25 09:15 | Assignment Submitted     | john@email    | Assignment #3 submitted
2026-06-25 09:00 | Grades Updated           | alice@email   | John - 85/100
```

Each log entry includes:
- ✅ Exact timestamp
- ✅ Action type (create, update, delete, approve, etc.)
- ✅ Who performed action (user email)
- ✅ What was changed (details)
- ✅ Old value vs new value (for updates)

---

## Part 3: Instructor Functionalities (After Approval)

### 3.1 Course Asset Creation

**Create New Course:**

1. Login as approved instructor (Alice)
2. Click "Teacher Panel" in navbar
3. Access: `/teacher/dashboard`
4. Click "+ Create New Course"

**Fill Course Form:**
```
Course Title:        "Advanced Web Development"
Description:         "Learn React, Node.js, and MongoDB"
Category:            "Web Development" ← dropdown
Price:               "0" (or any price) ← for paid courses
Level:               "Intermediate"
```

**Submit:**
- ✅ Course created in "draft" status
- ✅ Appears in teacher's course list
- ✅ Ready for content editing

**Database Entry:**
```javascript
{
  _id: ObjectId(...),
  title: "Advanced Web Development",
  description: "Learn React, Node.js, and MongoDB",
  instructor: ObjectId(...),  // Alice's ID
  category: "Web Development",
  price: 0,
  status: "draft",
  materials: [],
  assignments: [],
  projects: [],
  studentsEnrolled: []
}
```

---

### 3.2 Class Roster Management

**View Enrolled Students:**

1. In Teacher Dashboard, find course
2. Click "Manage Course" → "Students"
3. See enrollment applications:
   ```
   Student Name | Email            | Status   | Actions
   ─────────────┼──────────────────┼──────────┼──────────
   John Doe     | john@example.com | Pending  | Approve/Reject
   Jane Smith   | jane@example.com | Approved | View Profile
   ```

**Approve Student Enrollment:**
1. Click "Approve" next to student
2. Student status changes to "Approved"
3. Student gains course access
4. Email sent to student: "You're approved for this course!"

**Reject Student Enrollment:**
1. Click "Reject" next to student
2. Student status changes to "Rejected"
3. Student cannot access course
4. Email sent: "Your enrollment was not approved"

---

### 3.3 Study Materials Release

**Upload Course Materials:**

1. Go to Teacher Dashboard → Course → Materials
2. Click "+ Add Material"
3. Fill form:
   ```
   Material Title:    "Chapter 1 - Fundamentals"
   Material Type:     "PDF" (or Video, Link)
   Upload/URL:        [Choose file or paste link]
   ```
4. Submit
   - Material added to course
   - Students can download/view
   - Appears in student's Materials tab

**Materials Students Can See:**
```
Materials Tab:
├─ Chapter 1 - Fundamentals (PDF) ← Download
├─ Chapter 2 - Advanced Topics (Video) ← Play
└─ Additional Resources (Link) ← View
```

---

### 3.4 Evaluation & Task Management

#### A. Assignments

**Create Assignment:**

1. Go to Course → Assignments tab
2. Click "+ New Assignment"
3. Fill details:
   ```
   Assignment Title:    "Build a Todo App"
   Description:         "Create a React todo application"
   Deadline:            "2026-07-25"
   ```
4. Submit
   - Assignment published to students
   - Appears in student's Assignments tab
   - Deadline visible

**Grade Assignments:**

1. Go to Assignments tab
2. Click assignment → View Submissions
3. See student submissions:
   ```
   Student      | Submitted | Grade | Feedback
   ─────────────┼───────────┼───────┼──────────
   John Doe     | ✓         | -     | [input box]
   Jane Smith   | ✓         | -     | [input box]
   ```
4. Enter marks and feedback:
   ```
   Grade: 85/100
   Feedback: "Great work! Nice UI design."
   ```
5. Submit
   - Grade saved to database
   - Email sent to student with feedback

#### B. Projects

**Create Project:**

1. Go to Course → Projects tab
2. Click "+ New Project"
3. Fill details:
   ```
   Project Title:    "E-Commerce Platform"
   Description:      "Build a full-stack e-commerce app"
   Deadline:         "2026-08-01"
   Milestones:       [Milestone 1, Milestone 2, ...]
   ```
4. Submit
   - Project assigned to all course students
   - Shows in their Projects tab

**Track Project Progress:**
1. Go to Projects → [Project Name]
2. See milestone completion:
   ```
   Milestone         | John Doe | Jane Smith | Status
   ──────────────────┼──────────┼────────────┼──────
   Database Setup    | ✓        | ✓          | Complete
   Backend API       | ✓        | -          | In Progress
   Frontend UI       | -        | -          | Not Started
   ```

#### C. Assessments (Quizzes)

**Create Quiz:**

1. Go to Course → Assessments tab
2. Click "+ Create Quiz"
3. Set weights:
   ```
   Midterm Weight:     40%
   Final Exam Weight:  60%
   ```
4. Add questions:
   ```
   Question 1: "What is React?"
   - Option A: JavaScript library
   - Option B: Backend framework
   - Option C: Database
   ✓ Correct Answer: A
   ```
5. Submit

**Grade Submissions:**
1. Go to Assessments → [Quiz Name]
2. See student scores:
   ```
   Student      | Midterm | Final | Weighted Score
   ─────────────┼─────────┼───────┼────────────────
   John Doe     | 75      | 85    | 81 (40% + 51%)
   Jane Smith   | 90      | 95    | 93 (36% + 57%)
   ```
3. Final grade calculated automatically:
   ```
   Final Score = (Midterm × 0.40) + (Final × 0.60)
   ```

---

### 3.5 Task Notification Layer

**Real-Time Admin Task Notifications:**

1. Teacher logs in
2. Navbar shows 🔔 icon with count of unread tasks
3. Click 🔔 icon to see tasks:
   ```
   ADMIN TASKS:
   ├─ "Update Your Course Materials" (Unread)
   ├─ "Submit End-of-Course Report" (Unread)
   └─ "Participate in Faculty Meeting" (Read)
   ```
4. Click task to mark as read
5. Navbar updates automatically (polls every 30 seconds)

---

## Part 4: Student Functionalities

### 4.1 Course Discovery & Marketplace

**Browse Courses:**

1. Login as student
2. Click "Available Courses" in navbar
3. See course catalog:
   ```
   Course Card:
   ├─ Course Image
   ├─ Title: "Advanced Web Development"
   ├─ Instructor: "Alice Teacher"
   ├─ Price: "Free" or "₹999"
   ├─ Rating: ⭐⭐⭐⭐⭐ (4.5/5)
   ├─ Students: 145 enrolled
   └─ [Enroll Now] button
   ```

**Search & Filter:**
```
Search:          "React"
Category:        "Web Development"
Level:           "Intermediate"
Price Range:     "Free" to "₹500"
```

---

### 4.2 Structural Course Application

**Enroll in Course:**

1. Find course in catalog
2. Click "[Enroll Now]" button
3. Fill enrollment form:
   ```
   Full Name:            John Doe
   Phone Number:         +91-9876543210
   Date of Birth:        1998-05-15
   College Name:         ABC University
   Department:           Computer Science
   Course Type:          UG (Undergraduate)
   Statement of Intent:  "I want to improve my web dev skills"
   Background Exp.:      "3 months self-learning"
   ```
4. Submit
   - Enrollment status = "pending" (awaiting teacher approval)
   - Email sent: "Enrollment request submitted"
   - See "Pending Approval" status

**Teacher Reviews & Approves:**
- Teacher sees enrollment request
- Can approve or reject
- Student gets approval email

**After Approval:**
- Student enrollment status = "approved"
- Course appears in "My Courses" dashboard
- Full course access granted

---

### 4.3 Dynamic Course Workspace Suite

**Once Enrolled, Student Sees Three Tabs:**

#### Tab 1: Materials
```
Materials Available:
├─ Chapter 1 Basics (PDF) 📄
│  └─ [Download]
├─ Chapter 2 Video (Video) 📹
│  └─ [Play Video]
└─ Resources (Link) 🔗
   └─ [Open Link]
```

#### Tab 2: Assignments & Projects
```
Assignments:
├─ [Pending] Assignment 1 - Due 2026-07-25
│  └─ [Submit Assignment]
├─ [Submitted] Assignment 2 - Grade: 85/100
│  └─ [View Feedback]
└─ [Graded] Assignment 3 - Grade: 92/100

Projects:
├─ [In Progress] E-Commerce Platform
│  ├─ Milestone 1: Database Setup ✓
│  ├─ Milestone 2: Backend API 🔄
│  └─ Milestone 3: Frontend UI ⏳
└─ [Completed] Portfolio Project (Grade: 90/100)
```

#### Tab 3: Assessments
```
Quizzes:
├─ [Completed] Midterm Exam - Score: 75/100
├─ [Completed] Final Exam - Score: 85/100
└─ Final Grade: 81/100 (40% midterm + 60% final)
```

---

### 4.4 Classroom Alerts Layer

**Student Notifications:**

1. Student sees 🔔 icon in navbar
2. Click to see course-specific alerts:
   ```
   COURSE NOTIFICATIONS:
   ├─ "New Assignment Posted: Web Project"
   ├─ "Deadline Extended: Quiz #3"
   ├─ "Grades Posted: Midterm Exam"
   └─ "Announcement: Course Materials Updated"
   ```
3. Click notification to jump to relevant section
4. Marks as read automatically

**Email Notifications Also Sent:**
- New assignment posted
- Grade published
- Course announcement
- Deadline reminders

---

## Summary: Complete Student-Teacher-Admin Workflow

```
┌─────────────────────────────────────────────────────────────┐
│             STUDENT JOURNEY                                 │
├─────────────────────────────────────────────────────────────┤
1. REGISTRATION       → Student role → Immediate access
2. BROWSE COURSES     → Search & filter courses
3. ENROLL COURSE      → Submit application form
4. WAIT FOR APPROVAL  → Teacher reviews & approves
5. ACCESS COURSE      → See materials, assignments, projects
6. SUBMIT WORK        → Submit assignments & projects
7. VIEW GRADES        → See grades & feedback
8. TRACK PROGRESS     → View cumulative progress
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             TEACHER JOURNEY                                 │
├─────────────────────────────────────────────────────────────┤
1. REGISTRATION       → Instructor role → Status = "pending"
2. WAIT FOR APPROVAL  → Admin approves application
3. APPROVAL EMAIL     → Receives approval notification
4. LOGIN              → Can now access teacher panel
5. CREATE COURSES     → Build course structure
6. UPLOAD MATERIALS   → Add study materials
7. CREATE TASKS       → Assignments, projects, quizzes
8. MANAGE STUDENTS    → Approve enrollments
9. GRADE WORK         → Review & grade submissions
10. TRACK ANALYTICS   → See student performance
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             ADMIN JOURNEY                                   │
├─────────────────────────────────────────────────────────────┤
1. REVIEW TEACHERS    → See pending applications
2. APPROVE/REJECT     → Make approval decisions
3. SEND TASKS         → Broadcast to teachers
4. VIEW ANALYTICS     → See system statistics
5. MANAGE USERS       → Create/edit/delete accounts
6. AUDIT LOGS         → Track all system activities
└─────────────────────────────────────────────────────────────┘
```

---

## All Workflows Are Now Complete & Functional! ✅
