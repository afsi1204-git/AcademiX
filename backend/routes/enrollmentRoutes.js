const express = require('express');
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  updateProgress,
  getCourseEnrollments,
  updateEnrollmentStatus,
  dropCourse,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
// 🔥 CHANGED THIS LINE: Now handles the frontend application form submission seamlessly
router.post('/apply', protect, enrollCourse); 

router.get('/my-courses', protect, getMyEnrollments);
router.put('/:id/status', protect, authorize('instructor', 'admin'), updateEnrollmentStatus);
router.get('/:id', protect, getEnrollment);
router.put('/:id/progress', protect, updateProgress);
router.delete('/:id', protect, dropCourse);

// Instructor routes
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseEnrollments);

module.exports = router;
