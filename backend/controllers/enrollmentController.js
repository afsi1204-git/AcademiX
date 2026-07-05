// backend/controllers/enrollmentController.js
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { sendEnrollmentEmail } = require('../utils/emailService');
const { createOrder } = require('../utils/razorpayService');

/**
 * @desc    Enroll student in course (With Profile Form Metadata Bypass)
 * @route   POST /api/enrollments/apply
 * @access  Private
 */
exports.enrollCourse = async (req, res, next) => {
  try {
    // 1. Destructure the dynamic profile attributes submitted by our new form layout
    const { 
      courseId, 
      studentName, 
      phoneNumber, 
      dateOfBirth, 
      collegeName, 
      courseType, 
      department, 
      statementOfIntent, 
      backgroundExperience 
    } = req.body;

    const targetCourseId = courseId || req.params.courseId;

    if (!targetCourseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID context argument target missing.',
      });
    }

    const course = await Course.findById(targetCourseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // 2. Prevent duplicate active student processing maps
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: targetCourseId,
      status: { $ne: 'dropped' } // Ignore dropped states if they decide to re-register
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled or applied to this course tracking syllabus.',
      });
    }

    // 3. Construct and initialize the complete enrollment mapping schema record
    const enrollmentData = {
      student: req.user.id,
      course: targetCourseId,
      studentName,
      phoneNumber,
      dateOfBirth,
      collegeName,
      courseType,
      department,
      statementOfIntent,
      backgroundExperience,
      status: 'pending',
      paymentStatus: course.price === 0 ? 'completed' : 'pending',
      paidAt: course.price === 0 ? new Date() : undefined,
    };

    const enrollment = await Enrollment.create(enrollmentData);

    try {
      await sendEnrollmentEmail(req.user.email, studentName || req.user.name, course.title);
    } catch (emailErr) {
      console.error('Mail dispatch engine warning:', emailErr.message);
      // Non-blocking catch so execution continues smoothly even if mail settings are unconfigured
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. The instructor will review your request.',
      data: enrollment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get student enrollments
 * @route   GET /api/enrollments/my-courses
 * @access  Private
 */
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id, status: 'active' })
      .populate('course', 'title thumbnail price rating totalStudents')
      .sort('-enrollmentDate');

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollment details
 * @route   GET /api/enrollments/:id
 * @access  Private
 */
exports.getEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email')
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update enrollment progress
 * @route   PUT /api/enrollments/:id/progress
 * @access  Private
 */
exports.updateProgress = async (req, res, next) => {
  try{
    const { id } = req.params;
    const { lessonId, progress } = req.body;

    const enrollment = await Enrollment.findById(id);

    if(!enrollment){
      return res.status(404).json({
        success:false,
        message:'Enrollment not found',
      });
    }

    if(enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (lessonId) {
      const alreadyCompleted = enrollment.completedLessons.some(
        (lesson) => lesson.lessonId.toString() === lessonId
      );

      if (!alreadyCompleted) {
        enrollment.completedLessons.push({
          lessonId,
          completedAt: new Date(),
        });
      }
    }

    if (progress !== undefined) {
      enrollment.progress = Math.min(progress, 100);
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get course enrollments (Instructor)
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private
 */
exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email avatar')
      .sort('-enrollmentDate');

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Approve or reject a course enrollment application
 * @route   PUT /api/enrollments/:id/status
 * @access  Private (Instructor/Admin)
 */
exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or rejected.',
      });
    }

    const enrollment = await Enrollment.findById(id).populate('course');
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment application not found',
      });
    }

    const course = enrollment.course;
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const wasActive = enrollment.status === 'active';
    enrollment.status = status;
    await enrollment.save();

    if (status === 'active' && !wasActive) {
      await Course.findByIdAndUpdate(course._id, {
        $inc: { totalStudents: 1 },
        $addToSet: { studentsEnrolled: enrollment.student },
      });
    }

    if (status === 'rejected' && wasActive) {
      await Course.findByIdAndUpdate(course._id, {
        $inc: { totalStudents: -1 },
        $pull: { studentsEnrolled: enrollment.student },
      });
    }

    res.status(200).json({
      success: true,
      message: `Enrollment ${status === 'active' ? 'approved' : 'rejected'} successfully.`,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Drop course
 * @route   DELETE /api/enrollments/:id
 * @access  Private
 */
exports.dropCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    // Also clear the reference array mapping index down on the main course model structure tracker
    await Course.findByIdAndUpdate(enrollment.course, {
      $pull: { studentsEnrolled: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'Course dropped successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
