# Teacher Approval System - Quick Start Guide

## 🎯 What's New?

Teachers now must register and wait for admin approval before they can access the teacher dashboard and create courses.

---

## 🚀 Testing the Complete Flow

### **Step 1: Test Teacher Registration**

1. Open browser → `http://localhost:3000`
2. Click "Sign Up"
3. Fill the form:
   ```
   Name: Alice Teacher
   Email: alice@example.com
   Password: Test@123456
   Role: Instructor ← SELECT THIS
   ```
4. Click "Sign Up"
5. **Expected:** You see "Application Forwarded" message
   - ⏳ Your application is under review
   - Click "Go to Login" button

---

### **Step 2: Admin Approves the Teacher**

1. Login as admin:
   ```
   Email: admin@academix.com
   Password: Admin@123456
   ```

2. In navbar, click **"✅ Teacher Approvals"** button

3. You should see:
   - **PENDING tab** → Shows Alice's application
   - Teacher card with name, email, bio
   - Two buttons: "Approve" and "Reject"

4. Click **"Approve"**
   - Status should change to APPROVED
   - Page updates automatically
   - Alice receives approval email (if email configured)

---

### **Step 3: Teacher Accesses Dashboard**

1. **Logout** from admin account
2. **Login as Alice**:
   ```
   Email: alice@example.com
   Password: Test@123456
   ```

3. In navbar, you now see **"👨‍🏫 Teacher Panel"** button
   - This button ONLY appears after approval

4. Click **"Teacher Panel"**
   - Go to `/teacher/dashboard`
   - See dashboard with stats:
     - Total Courses (0)
     - Total Students (0)
     - Total Assignments (0)

5. Click **"+ Create New Course"**
   - Fill course details:
     ```
     Course Title: React Basics
     Description: Learn React from scratch
     Category: Programming
     Price: 0 (Free)
     ```
   - Click "Create Course"
   - Course appears in "My Courses" section

---

### **Step 4: Test Rejection**

1. Create **another teacher account**:
   ```
   Name: Bob Teacher
   Email: bob@example.com
   Role: Instructor
   ```

2. Login as admin again
3. Go to **Teacher Approvals**
4. Click **"Reject"** on Bob's application
   - Bob receives rejection email
   - Bob's application moves to REJECTED tab
   - Bob can see status when he logs in

---

### **Step 5: Verify Unapproved Teacher Blocking**

1. Have Bob (rejected teacher) try to access `/teacher/dashboard` directly
   - **Result:** Blocked with "Application Under Review" message
   - Only approved teachers can access

---

## 🔑 Key Access Points

### For Teachers:
- **Register:** `/register` → Select "Instructor" role
- **Dashboard:** `/teacher/dashboard` (only if approved)
- **Navbar:** "Teacher Panel" button appears after approval

### For Admins:
- **Approval Dashboard:** `/admin/teacher-approvals`
- **Navbar:** "✅ Teacher Approvals" button
- **Tabs:** Pending | Approved | Rejected

---

## 📧 Email Notifications

**Teacher Approval Email includes:**
- Congratulations message
- Link to teacher dashboard
- List of available features

**Teacher Rejection Email includes:**
- Thank you message
- Option to reapply
- Support contact info

---

## 🔒 Security Features

✅ **Protected Routes:**
- Only admins can approve teachers
- Only approved teachers can access dashboard
- JWT token validation on all requests

✅ **Status Validation:**
- Blocks unapproved instructors from accessing any teacher features
- Forces them to wait for admin review

---

## 📋 Approval Status States

| Status | Can Access Dashboard | Can Create Courses | Notes |
|--------|----------------------|--------------------|-------|
| pending | ❌ No | ❌ No | Waiting for admin review |
| approved | ✅ Yes | ✅ Yes | Full teacher access |
| rejected | ❌ No | ❌ No | Can register again |
| none | ❌ N/A | ❌ N/A | Only for students |

---

## 🐛 Troubleshooting

**Issue:** Teacher Panel button doesn't appear
- ✅ Logout and login again
- ✅ Refresh the page
- ✅ Check if admin approved the application

**Issue:** Admin can't find Teacher Approvals button
- ✅ Make sure you're logged in as admin
- ✅ Verify admin account has role = 'admin'

**Issue:** Emails not sending
- ✅ Check `.env` for EMAIL_USER and EMAIL_PASSWORD
- ✅ Make sure email service is enabled
- ✅ Check backend console for errors

---

## 📱 Admin Dashboard Flow

```
Admin Login
    ↓
Click "Teacher Approvals" button
    ↓
See 3 tabs:
├─ Pending (new applications)
├─ Approved (approved teachers)
└─ Rejected (rejected applications)
    ↓
Click "Approve" or "Reject" on pending teacher
    ↓
Teacher receives email notification
    ↓
If approved: Teacher can now access dashboard
```

---

## 👨‍🎓 Teacher Dashboard Features

Once approved, teachers get access to:

- ✅ **Course Statistics**
  - Total courses created
  - Total students enrolled
  - Total assignments created

- ✅ **Create New Course**
  - Add course title, description
  - Select category
  - Set price (free or paid)

- ✅ **Manage Courses**
  - View all created courses
  - Edit course details
  - Manage enrollments
  - Add materials, assignments, quizzes

---

## 💡 Pro Tips

1. **Admin Account:**
   - Email: `admin@academix.com`
   - Password: `Admin@123456`
   - Already has approval = 'admin' role

2. **Test Multiple Teachers:**
   - Create several teacher accounts
   - Approve some, reject others
   - See the dashboard work with different scenarios

3. **Check Email Configuration:**
   - For email notifications to work, configure in `.env`:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_app_password
     ```

4. **Refresh After Changes:**
   - After admin approves a teacher
   - Teacher should logout/login again
   - Or refresh page to see "Teacher Panel" button

---

## ✨ System Ready!

The teacher approval system is fully functional and integrated into your LMS. Teachers can now:

1. ✅ Register with approval request
2. ✅ Await admin review
3. ✅ Get email notifications
4. ✅ Access full teacher features after approval
5. ✅ Create courses and manage students

**Start testing now!** 🎉
