const express = require('express');
const {
  createQuiz,
  getCourseQuizzes,
  getQuiz,
  updateQuiz,
  publishQuiz,
  submitQuizAttempt,
  getQuizAttempt,
  getStudentAttempts,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Instructor routes
router.post('/', protect, authorize('instructor'), createQuiz);
router.put('/:id', protect, authorize('instructor'), updateQuiz);
router.patch('/:id/publish', protect, authorize('instructor'), publishQuiz);

// Public/Student routes
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', getQuiz);

// Student routes - Quiz attempts
router.post('/attempts/submit', protect, submitQuizAttempt);
router.get('/attempts/:id', protect, getQuizAttempt);
router.get('/student/my-attempts', protect, getStudentAttempts);

module.exports = router;
