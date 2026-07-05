// routes/courseRoutes.js
const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  addSection,
  getInstructorCourses,
  addReview,
  addMaterial,
  deleteMaterial,
  addAssignment,
  deleteAssignment,
  addProject,
  deleteProject,
  getCourseGrades,
  updateCourseGrades,
  updateAssignmentGrade,
  updateProjectGrade,
  getCourseAssignments, 
  getCourseProjects     
} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// -----------------------------------------------------------------------
// PUBLIC CATALOGUE COUPLING ENDPOINTS
// -----------------------------------------------------------------------
router.get('/', getCourses); // Fetches everything via the updated controller
router.get('/:id', getCourseById);

// -----------------------------------------------------------------------
// PROTECTED INSTRUCTOR MANAGEMENT ENDPOINTS
// -----------------------------------------------------------------------
router.post('/', protect, authorize('instructor'), createCourse);
router.put('/:id', protect, authorize('instructor'), updateCourse);
router.delete('/:id', protect, authorize('instructor'), deleteCourse);
router.patch('/:id/publish', protect, authorize('instructor'), publishCourse);
router.post('/:id/sections', protect, authorize('instructor'), addSection);
router.get('/instructor/my-courses', protect, authorize('instructor'), getInstructorCourses);

// Student reviews
router.post('/:id/reviews', protect, addReview);


// 🎓 --- STUDENT CLASSROOM WORKSPACE ALIGNED ENDPOINTS --- 🎓

// 1. Study Materials Tab Layout
router.route('/:id/materials')
  .get(protect, async (req, res, next) => {
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(req.params.id).select('materials');
      return res.status(200).json({ success: true, data: course?.materials || [] });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  })
  .post(protect, authorize('instructor'), addMaterial);

router.delete('/:id/materials/:materialId', protect, authorize('instructor'), deleteMaterial);


// 2. Homework Logs Tab Layout
router.route('/:id/assignments')
  .get(protect, getCourseAssignments || (async (req, res) => {
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(req.params.id).select('assignments');
      res.status(200).json({ success: true, data: course?.assignments || [] });
    } catch(err) { res.status(500).json({ success: false, message: err.message }) }
  }))
  .post(protect, authorize('instructor'), addAssignment);

router.delete('/:id/assignments/:assignmentId', protect, authorize('instructor'), deleteAssignment);


// 3. Projects Suite Tab Layout
router.route('/:id/assessments')
  .get(protect, getCourseProjects || (async (req, res) => {
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(req.params.id).select('projects assessments');
      res.status(200).json({ success: true, data: course?.projects || course?.assessments || [] });
    } catch(err) { res.status(500).json({ success: false, message: err.message }) }
  }))
  .post(protect, authorize('instructor'), addProject);

router.route('/:id/projects')
  .get(protect, getCourseProjects || (async (req, res) => {
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(req.params.id).select('projects');
      res.status(200).json({ success: true, data: course?.projects || [] });
    } catch(err) { res.status(500).json({ success: false, message: err.message }) }
  }))
  .post(protect, authorize('instructor'), addProject);

router.delete('/:id/projects/:projectId', protect, authorize('instructor'), deleteProject);


// 4. Exams & Grading Tab Layout
router.get('/:id/grades', protect, getCourseGrades);
router.put('/:id/grades', protect, authorize('instructor'), updateCourseGrades);
router.put('/:id/grades/assignment', protect, authorize('instructor'), updateAssignmentGrade);
router.put('/:id/grades/project', protect, authorize('instructor'), updateProjectGrade);

module.exports = router;