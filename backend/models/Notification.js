// models/Notification.js
const mongoose = require('mongoose');

// Notification Schema for email and in-app notifications
const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Keep false to allow target broadcasts (like all course enrollees or all teachers)
    },
    type: {
      type: String,
      enum: [
        'enrollment',
        'course-update', // Used for Instructor-driven course wide broadcasts!
        'quiz-reminder',
        'certificate',
        'payment',
        'message',
        'admin-alert', // Used for Admin Tasks!
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Dynamically maps to Course ID, Payment ID, Quiz ID, etc.
      required: false,
    },
    relatedModel: {
      type: String,
      enum: ['Course', 'Enrollment', 'Payment', 'Quiz', 'User'],
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false, // Standard status field for unique single-user notifications
    },
    // Tracking array to see who read a global or course-wide broadcast notification task
    readByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sendEmail: {
      type: Boolean,
      default: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      required: false, // URL path string helper for redirect hooks (e.g., "/student/my-courses")
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ⚡ Compound Indexes to optimize database retrieval metrics
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ relatedId: 1, relatedModel: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
