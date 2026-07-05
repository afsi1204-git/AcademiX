const mongoose = require('mongoose');

// Grade Schema for tracking student marks for a course
const GradeSchema = new mongoose.Schema(
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
    midtermRaw: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalRaw: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    midtermWeight: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    finalWeight: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    assignmentMarks: [
      {
        assignmentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        marks: {
          type: Number,
          default: 0,
          min: 0,
        },
        status: {
          type: String,
          enum: ['Pending', 'Graded'],
          default: 'Graded',
        },
        gradedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    projectMarks: [
      {
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        marks: {
          type: Number,
          default: 0,
          min: 0,
        },
        status: {
          type: String,
          enum: ['Pending', 'Graded'],
          default: 'Graded',
        },
        gradedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index to guarantee exactly one Grade document per student and course
GradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Grade', GradeSchema);
