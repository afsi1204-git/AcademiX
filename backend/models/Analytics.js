const mongoose = require('mongoose');

// Analytics Schema for tracking platform metrics
const AnalyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'total_students',
        'total_courses',
        'total_revenue',
        'course_enrollments',
        'user_activity',
      ],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metric: String, // Course ID, Instructor ID, or general
    value: Number,
    data: mongoose.Schema.Types.Mixed, // Flexible field for additional data
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
