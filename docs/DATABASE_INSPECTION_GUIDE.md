# Database Inspection & Data Management Guide

## Part 1: View Database Data Using MongoDB Atlas Web Interface

### Step 1: Access MongoDB Atlas

1. Go to: https://www.mongodb.com/cloud/atlas
2. Login with your account:
   ```
   Email: (your atlas email)
   Password: (your atlas password)
   ```
3. Click on "Databases" in sidebar

---

### Step 2: Select Your Cluster

1. Find your cluster: `cluster0`
2. Click on it
3. Click "Browse Collections" button

---

### Step 3: View Collections (Tables)

You'll see all collections (tables) in your database:

```
Academix Database Collections:
├─ users              ← Student, Teacher, Admin accounts
├─ courses            ← All courses created
├─ enrollments        ← Student-Course relationships
├─ grades             ← Student grades & scores
├─ assignments        ← Course assignments
├─ quizzes            ← Quiz data
├─ quizattempts       ← Student quiz submissions
├─ certificates       ← Course completion certificates
├─ analytics          ← Student performance metrics
├─ notifications      ← System notifications
├─ instructorlogs     ← Teacher action logs
└─ payments           ← Payment records
```

---

### Step 4: View Data in Each Collection

#### A. View All Users

1. Click "users" collection
2. See all registered users:
   ```
   _id: ObjectId(...)
   name: "John Student"
   email: "john@example.com"
   password: "[hashed]"
   role: "student"
   instructorRequestStatus: "none"
   createdAt: 2026-06-25T10:30:00Z
   ```

**Filter Users by Role:**
- In the search box, enter:
  ```json
  { "role": "student" }
  ```
- Shows only student accounts

**Filter Pending Teachers:**
```json
{ "role": "instructor", "instructorRequestStatus": "pending" }
```

#### B. View All Courses

1. Click "courses" collection
2. See course data:
   ```
   _id: ObjectId(...)
   title: "Advanced Web Development"
   description: "Learn React, Node.js, MongoDB"
   instructor: ObjectId(...) → Teacher's ID
   category: "Web Development"
   price: 0
   status: "published"
   studentsEnrolled: [ObjectId(...), ObjectId(...)]
   materials: [...]
   assignments: [...]
   createdAt: 2026-06-25T11:00:00Z
   ```

**Filter by Instructor:**
```json
{ "instructor": ObjectId("...") }
```

**Filter by Price:**
```json
{ "price": { "$gt": 0 } }
```
Shows paid courses only

#### C. View Enrollments

1. Click "enrollments" collection
2. See student-course relationships:
   ```
   _id: ObjectId(...)
   student: ObjectId(...) → Student's ID
   course: ObjectId(...) → Course's ID
   studentName: "John Doe"
   status: "approved"
   paymentStatus: "completed"
   paidAt: 2026-06-25T12:00:00Z
   enrolledAt: 2026-06-25T11:30:00Z
   ```

**Filter by Status:**
```json
{ "status": "pending" }
```
Shows pending enrollment applications

#### D. View Grades

1. Click "grades" collection
2. See student grades:
   ```
   _id: ObjectId(...)
   student: ObjectId(...)
   course: ObjectId(...)
   assignment1: 85
   assignment2: 90
   midterm: 75
   final: 85
   totalScore: 82.5
   grade: "A"
   createdAt: 2026-06-25T13:00:00Z
   ```

---

## Part 2: View Database Using MongoDB Compass (Desktop Client)

### Installation

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install on your computer
3. Open application

---

### Step 1: Connect to Your Database

1. Open MongoDB Compass
2. Click "New Connection"
3. Paste connection string:
   ```
   mongodb://127.0.0.1:27017/academix
   ```
4. Click "Connect"

---

### Step 2: Browse Databases & Collections

**Left Sidebar Shows:**
```
admin
config
Academix (your database)
  ├─ users
  ├─ courses
  ├─ enrollments
  ├─ grades
  └─ [other collections]
```

---

### Step 3: Query Data

**In Compass, you can:**

1. **View All Documents**
   - Click collection
   - All documents displayed in table format

2. **Filter Data**
   - Click "Filter" button
   - Enter MongoDB query:
     ```json
     { "role": "instructor", "instructorRequestStatus": "approved" }
     ```
   - Shows matching documents only

3. **Search Text**
   - Use search box to find by fields
   - Example: Search for "Alice" finds all with "Alice" in name

4. **Sort Data**
   - Click column header to sort ascending/descending
   - Or use sort options

5. **Export Data**
   - Select documents
   - Click "Export" → Save as JSON/CSV

---

## Part 3: View Data Using Command Line (MongoDB Shell)

### Step 1: Open Terminal

```powershell
# Windows PowerShell
```

### Step 2: Connect to Database

```bash
mongosh "mongodb://127.0.0.1:27017/academix"
```

---

### Step 3: Query Commands

**Show all databases:**
```javascript
show databases
```

**Use specific database:**
```javascript
use Academix
```

**Show all collections:**
```javascript
show collections
```

**View all users:**
```javascript
db.users.find()
```

**View all courses:**
```javascript
db.courses.find()
```

**View specific user:**
```javascript
db.users.findOne({ email: "admin@academix.com" })
```

**Count total students:**
```javascript
db.users.countDocuments({ role: "student" })
```

**Count pending teachers:**
```javascript
db.users.countDocuments({ 
  role: "instructor", 
  instructorRequestStatus: "pending" 
})
```

**Count approved teachers:**
```javascript
db.users.countDocuments({ 
  role: "instructor", 
  instructorRequestStatus: "approved" 
})
```

**View all courses with prices:**
```javascript
db.courses.find({}, { title: 1, price: 1, instructor: 1 })
```

**View course enrollments:**
```javascript
db.enrollments.find({ status: "approved" })
```

**View student grades:**
```javascript
db.grades.find({ student: ObjectId("...") })
```

**Count total courses:**
```javascript
db.courses.countDocuments()
```

**View with pretty formatting:**
```javascript
db.users.find().pretty()
```

---

## Part 4: Practical Database Inspection Examples

### Example 1: Check if Teacher Was Approved

**Question:** Was Alice Teacher approved?

**MongoDB Atlas Web:**
1. Go to users collection
2. Filter: `{ email: "alice@example.com" }`
3. Look at `instructorRequestStatus` field
4. Result: "approved" or "pending"

**MongoDB Compass:**
1. Connect to database
2. Click users collection
3. Filter: `{ email: "alice@example.com" }`
4. See status in table

**Command Line:**
```javascript
db.users.findOne({ email: "alice@example.com" }).instructorRequestStatus
```

---

### Example 2: View All Courses by a Teacher

**Question:** How many courses did Alice create?

**MongoDB Atlas Web:**
1. Click courses collection
2. You need Alice's ObjectId first:
   ```json
   db.users.findOne({ email: "alice@example.com" })
   // Copy _id value
   ```
3. Filter courses:
   ```json
   { "instructor": ObjectId("654abc123...") }
   ```

**Command Line:**
```javascript
// Get Alice's ID
const alice = db.users.findOne({ email: "alice@example.com" })
const aliceId = alice._id

// Count her courses
db.courses.countDocuments({ instructor: aliceId })

// View all her courses
db.courses.find({ instructor: aliceId }).pretty()
```

---

### Example 3: Check Student Enrollment Status

**Question:** Is John enrolled in the Web Dev course?

**MongoDB Atlas Web:**
1. Click enrollments collection
2. Get student ObjectId:
   ```json
   db.users.findOne({ email: "john@example.com" })
   ```
3. Get course ObjectId:
   ```json
   db.courses.findOne({ title: "Web Development" })
   ```
4. Filter enrollments:
   ```json
   { "student": ObjectId("..."), "course": ObjectId("...") }
   ```

**Command Line:**
```javascript
const john = db.users.findOne({ email: "john@example.com" })
const course = db.courses.findOne({ title: "Web Development" })

db.enrollments.findOne({ 
  student: john._id, 
  course: course._id 
}).pretty()
```

---

### Example 4: View All Pending Enrollments

**Question:** Which students are waiting for enrollment approval?

**MongoDB Atlas Web:**
1. Click enrollments collection
2. Filter: `{ "status": "pending" }`
3. See list of pending students

**Command Line:**
```javascript
db.enrollments.find({ status: "pending" }).pretty()

// Also get their names
db.enrollments.aggregate([
  { $match: { status: "pending" } },
  {
    $lookup: {
      from: "users",
      localField: "student",
      foreignField: "_id",
      as: "studentDetails"
    }
  },
  { $project: { studentName: 1, status: 1, "studentDetails.email": 1 } }
]).pretty()
```

---

### Example 5: Check Student Grades

**Question:** What is John's total score in Web Dev course?

**MongoDB Atlas Web:**
1. Click grades collection
2. Get John's and course's ObjectIds
3. Filter: `{ "student": ObjectId("..."), "course": ObjectId("...") }`
4. See all grade fields

**Command Line:**
```javascript
const john = db.users.findOne({ email: "john@example.com" })
const course = db.courses.findOne({ title: "Web Development" })

const grades = db.grades.findOne({
  student: john._id,
  course: course._id
})

console.log("Total Score:", grades.totalScore)
console.log("Grade:", grades.grade)
console.log("Details:", grades)
```

---

## Part 5: System Statistics Queries

### Get System Overview

```javascript
// Total users by role
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
]).pretty()

// Output:
// { _id: "student", count: 45 }
// { _id: "instructor", count: 8 }
// { _id: "admin", count: 1 }

// Total courses
db.courses.countDocuments()

// Total enrollments (all statuses)
db.enrollments.countDocuments()

// Approved enrollments
db.enrollments.countDocuments({ status: "approved" })

// Pending enrollments
db.enrollments.countDocuments({ status: "pending" })

// Total revenue (paid courses only)
db.enrollments.aggregate([
  { $match: { paymentStatus: "completed" } },
  {
    $lookup: {
      from: "courses",
      localField: "course",
      foreignField: "_id",
      as: "courseData"
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: { $arrayElemAt: ["$courseData.price", 0] } }
    }
  }
]).pretty()

// Average course rating
db.courses.aggregate([
  { $group: { _id: null, avgRating: { $avg: "$rating" } } }
]).pretty()

// Most enrolled course
db.courses.aggregate([
  { $sort: { totalStudents: -1 } },
  { $limit: 1 },
  { $project: { title: 1, totalStudents: 1 } }
]).pretty()
```

---

## Part 6: Backup & Export Data

### Export to CSV/JSON

**Using MongoDB Atlas:**
1. Go to collection
2. Click "..." menu
3. Select "Export Collection"
4. Choose format (CSV, JSON)
5. Download file

**Using MongoDB Compass:**
1. Select documents or collection
2. Right-click → Export
3. Choose format
4. Save file

**Using Command Line:**
```bash
# Export users as JSON
mongoexport --uri "mongodb+srv://afsi1204_db_user:rTfoeSHp6ZcOf9Hb@cluster0.rqkijxl.mongodb.net/Academix" \
  --collection users \
  --out users.json

# Export with filter
mongoexport --uri "mongodb+srv://..." \
  --collection users \
  --query '{"role":"instructor"}' \
  --out teachers.json
```

---

## Part 7: Quick Reference - Key Queries

```javascript
// All students
db.users.find({ role: "student" })

// All approved teachers
db.users.find({ role: "instructor", instructorRequestStatus: "approved" })

// All pending teacher applications
db.users.find({ role: "instructor", instructorRequestStatus: "pending" })

// All courses (with instructor names)
db.courses.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "instructor",
      foreignField: "_id",
      as: "instructor"
    }
  }
])

// Student enrollment history
db.enrollments.find({ student: ObjectId("...") })

// All assignments for a course
db.courses.findOne({ _id: ObjectId("...") }).assignments

// All quizzes
db.quizzes.find()

// Student quiz attempts
db.quizattempts.find({ student: ObjectId("...") })

// System notifications
db.notifications.find({ createdAt: { $gte: new Date(ISODate()) } })

// Teacher action logs
db.instructorlogs.find({ instructor: ObjectId("...") })
```

---

## Summary

You can inspect your database using:

1. **MongoDB Atlas Web** - Easiest, no installation
2. **MongoDB Compass** - Desktop GUI, offline capable
3. **MongoDB Shell (mongosh)** - Command line, most powerful
4. **Export Data** - Backup & analysis

All three methods show the same data, choose based on your preference! ✅

**All workflows and data inspectionare now complete!**
