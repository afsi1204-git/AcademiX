const mongoose = require('mongoose');

// Quiz Attempt Schema - tracks student quiz submissions
const QuizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: Date,
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        marksObtained: Number,
      },
    ],
    marksObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: Number,
    percentage: Number,
    isPassed: Boolean,
    duration: Number, // in seconds
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'graded'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
