// backend/models/Enrollment.js
const mongoose = require('mongoose');

// Enrollment Schema for tracking student course enrollments
const EnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // 🔥 NEW: Student Profile Fields from application form
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    courseType: {
      type: String,
      enum: ['UG', 'PG'],
      default: 'UG',
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    statementOfIntent: {
      type: String,
      trim: true,
    },
    backgroundExperience: {
      type: String,
      trim: true,
    },
    // Legacy tracking parameters
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        lessonId: mongoose.Schema.Types.ObjectId,
        completedAt: Date,
      },
    ],
    lastAccessedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'completed', 'dropped'],
      default: 'pending',
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: Date,
    certificateUrl: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentId: String, // Razorpay payment ID
    amountPaid: Number,
    paidAt: Date,
  },
  { timestamps: true }
);

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
