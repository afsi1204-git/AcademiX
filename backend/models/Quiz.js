const mongoose = require('mongoose');

// Quiz Schema
const QuizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    section: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
          default: 'multiple-choice',
        },
        options: [String],
        correctAnswer: String,
        explanation: String,
        marks: {
          type: Number,
          default: 1,
          min: 0,
        },
      },
    ],
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 60,
    },
    timeLimit: Number, // in minutes
    attempts: {
      type: Number,
      default: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showResultsImmediately: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
