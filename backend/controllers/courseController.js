const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { uploadImage } = require('../utils/cloudinaryService');
const Grade = require('../models/Grade');
const { logInstructorAction } = require('../utils/logger');

/**
 * @desc    Get all courses with filtering and search
 * @route   GET /api/courses
 * @access  Public / Private (Dynamic)
 */
exports.getCourses = async (req, res, next) => {
  try {
    const { category, level, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    let filter = {};
    
    // Check if the request comes from an authenticated instructor managing their courses
    if (req.user && req.user.role === 'instructor') {
      filter.instructor = req.user.id;
    } else {
      // ✅ FIX: Removed "filter.isPublished = true" constraint completely.
      // This allows general students and public visitors to see all your courses seamlessly.
    }

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('instructor', 'name avatar expertise');

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate('instructor', 'name avatar expertise bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create course (Instructor only)
 * @route   POST /api/courses
 * @access  Private
 */
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, level, price, learningOutcomes, requirements, tags, isPublished, weeks, category } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description',
      });
    }

    let thumbnail = null;

    if (req.files && req.files.thumbnail) {
      const file = req.files.thumbnail;
      const result = await uploadImage(file.tempFilePath, `course_thumbnail_${Date.now()}`);
      thumbnail = result.secure_url;
    }

    const shouldPublish = isPublished === undefined ? true : isPublished;

    const course = await Course.create({
      title,
      description,
      category: category || 'Other',
      level: level || 'Beginner',
      price: price || 0,
      thumbnail: thumbnail || 'https://via.placeholder.com/400x300',
      instructor: req.user.id,
      learningOutcomes: learningOutcomes || [],
      requirements: requirements || [],
      tags: tags || [],
      sections: [],
      weeks: weeks || 8,
      isPublished: shouldPublish,
      status: shouldPublish ? 'published' : 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update course (Instructor only)
 * @route   PUT /api/courses/:id
 * @access  Private
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const updateData = req.body;

    if (updateData.isPublished !== undefined) {
      updateData.status = updateData.isPublished ? 'published' : 'draft';
    }

    if (req.files && req.files.thumbnail) {
      const file = req.files.thumbnail;
      const result = await uploadImage(file.tempFilePath, `course_thumbnail_${Date.now()}`);
      updateData.thumbnail = result.secure_url;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete course (Instructor only)
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted susccessfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Publish/Unpublish course
 * @route   PATCH /api/courses/:id/publish
 * @access  Private
 */
exports.publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    course.isPublished = isPublished;
    course.status = isPublished ? 'published' : 'draft';
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Add section to course
 * @route   POST /api/courses/:id/sections
 * @access  Private
 */
exports.addSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    course.sections.push({
      title,
      description,
      lessons: [],
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private
 */
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Add review to course
 * @route   POST /api/courses/:id/reviews
 * @access  Private
 */
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating between 1 and 5',
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.reviews.push({
      user: req.user.id,
      rating,
      comment,
    });

    const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0);
    course.rating = totalRating / course.reviews.length;

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 🎓 CLASSROOM SUITE: MATERIALS, ASSIGNMENTS, PROJECTS, GRADING
// ==========================================

/**
 * @desc    Add material to course
 * @route   POST /api/courses/:id/materials
 * @access  Private (Instructor only)
 */
exports.addMaterial = async (req, res, next) => {
  try {
    const { title, type, url } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Please provide title and type' });
    }

    course.materials.push({ title, type, url });
    await course.save();

    await logInstructorAction(req.user.id, 'ADD_MATERIAL', `Added material "${title}" (${type}) to course "${course.title}"`);

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: course.materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete material from course
 * @route   DELETE /api/courses/:id/materials/:materialId
 * @access  Private (Instructor only)
 */
exports.deleteMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const title = material.title;
    course.materials.pull(req.params.materialId);
    await course.save();

    await logInstructorAction(req.user.id, 'DELETE_MATERIAL', `Deleted material "${title}" from course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
      data: course.materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get assignments for a specific course
 * @route   GET /api/courses/:id/assignments
 * @access  Private
 */
exports.getCourseAssignments = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course.assignments || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add assignment to course
 * @route   POST /api/courses/:id/assignments
 * @access  Private (Instructor only)
 */
exports.addAssignment = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide title' });
    }

    course.assignments.push({ title, description, deadline });
    await course.save();

    await logInstructorAction(req.user.id, 'ADD_ASSIGNMENT', `Added assignment "${title}" to course "${course.title}"`);

    res.status(201).json({
      success: true,
      message: 'Assignment added successfully',
      data: course.assignments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete assignment from course
 * @route   DELETE /api/courses/:id/assignments/:assignmentId
 * @access  Private (Instructor only)
 */
exports.deleteAssignment = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const title = assignment.title;
    course.assignments.pull(req.params.assignmentId);
    await course.save();

    await logInstructorAction(req.user.id, 'DELETE_ASSIGNMENT', `Deleted assignment "${title}" from course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
      data: course.assignments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get projects for a specific course
 * @route   GET /api/courses/:id/projects
 * @access  Private
 */
exports.getCourseProjects = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course.projects || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add project to course
 * @route   POST /api/courses/:id/projects
 * @access  Private (Instructor only)
 */
exports.addProject = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide title' });
    }

    course.projects.push({ title, description, deadline });
    await course.save();

    await logInstructorAction(req.user.id, 'ADD_PROJECT', `Added project "${title}" to course "${course.title}"`);

    res.status(201).json({
      success: true,
      message: 'Project assigned successfully',
      data: course.projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete project from course
 * @route   DELETE /api/courses/:id/projects/:projectId
 * @access  Private (Instructor only)
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const project = course.projects.id(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const title = project.title;
    course.projects.pull(req.params.projectId);
    await course.save();

    await logInstructorAction(req.user.id, 'DELETE_PROJECT', `Deleted project "${title}" from course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: course.projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get grades for all enrolled students or an individual student in a course
 * @route   GET /api/courses/:id/grades
 * @access  Private
 */
exports.getCourseGrades = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrolledGradesList = [];

    if (req.user.role === 'instructor' || req.user.role === 'admin') {
      // 1. Instructor/Admin View: Gather all enrolled students
      const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email');
      const grades = await Grade.find({ course: courseId });

      const gradesMap = {};
      grades.forEach(g => {
        if (g.student) gradesMap[g.student.toString()] = g;
      });

      enrolledGradesList = enrollments.map(e => {
        const student = e.student;
        if (!student) return null;

        const studentGrade = gradesMap[student._id.toString()] || {
          midtermRaw: 0,
          finalRaw: 0,
          midtermWeight: 40,
          finalWeight: 60,
          assignmentMarks: [],
          projectMarks: []
        };

        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          midtermRaw: studentGrade.midtermRaw,
          finalRaw: studentGrade.finalRaw,
          midtermWeight: studentGrade.midtermWeight,
          finalWeight: studentGrade.finalWeight,
          assignmentMarks: studentGrade.assignmentMarks || [],
          projectMarks: studentGrade.projectMarks || []
        };
      }).filter(item => item !== null);

      return res.status(200).json({
        success: true,
        grades: enrolledGradesList,
        assignments: course.assignments || [],
        projects: course.projects || []
      });

    } else {
      // 2. Student View: Normalized list to match dashboard list map structure directly!
      const studentGrade = await Grade.findOne({ student: req.user.id, course: courseId });
      
      const normalizedGrades = [
        {
          taskName: 'Midterm Evaluation',
          score: studentGrade ? studentGrade.midtermRaw : 0,
          feedback: `Weight allocation parameter: ${studentGrade ? studentGrade.midtermWeight : 40}%`
        },
        {
          taskName: 'Final Examination',
          score: studentGrade ? studentGrade.finalRaw : 0,
          feedback: `Weight allocation parameter: ${studentGrade ? studentGrade.finalWeight : 60}%`
        }
      ];

      // Merge evaluated individual assignments
      if (studentGrade && studentGrade.assignmentMarks) {
        studentGrade.assignmentMarks.forEach((a, idx) => {
          normalizedGrades.push({
            taskName: `Assignment Assessment (Ref ID: ${a.assignmentId})`,
            score: a.marks,
            feedback: `Status tracking: ${a.status || 'Graded'}`
          });
        });
      }

      // Merge evaluated projects
      if (studentGrade && studentGrade.projectMarks) {
        studentGrade.projectMarks.forEach((p, idx) => {
          normalizedGrades.push({
            taskName: `Project Milestone Submission (Ref ID: ${p.projectId})`,
            score: p.marks,
            feedback: `Status tracking: ${p.status || 'Graded'}`
          });
        });
      }

      return res.status(200).json({
        success: true,
        data: normalizedGrades
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Save/update midterm & final grades and weights for a student
 * @route   PUT /api/courses/:id/grades
 * @access  Private (Instructor only)
 */
exports.updateCourseGrades = async (req, res, next) => {
  try {
    const { studentId, midtermRaw, finalRaw, midtermWeight, finalWeight } = req.body;
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let grade = await Grade.findOne({ student: studentId, course: courseId });
    if (!grade) {
      grade = new Grade({
        student: studentId,
        course: courseId,
        midtermRaw: midtermRaw || 0,
        finalRaw: finalRaw || 0,
        midtermWeight: midtermWeight !== undefined ? midtermWeight : 40,
        finalWeight: finalWeight !== undefined ? finalWeight : 60,
      });
    } else {
      if (midtermRaw !== undefined) grade.midtermRaw = midtermRaw;
      if (finalRaw !== undefined) grade.finalRaw = finalRaw;
      if (midtermWeight !== undefined) grade.midtermWeight = midtermWeight;
      if (finalWeight !== undefined) grade.finalWeight = finalWeight;
    }

    await grade.save();

    await logInstructorAction(req.user.id, 'GRADE_UPDATE', `Updated exam scores/weights for student ID ${studentId} in course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Grades updated successfully',
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Save/update assignment marks for a student
 * @route   PUT /api/courses/:id/grades/assignment
 * @access  Private (Instructor only)
 */
exports.updateAssignmentGrade = async (req, res, next) => {
  try {
    const { studentId, assignmentId, marks } = req.body;
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let grade = await Grade.findOne({ student: studentId, course: courseId });
    if (!grade) {
      grade = new Grade({
        student: studentId,
        course: courseId,
        assignmentMarks: [{ assignmentId, marks, status: 'Graded' }]
      });
    } else {
      const itemIndex = grade.assignmentMarks.findIndex(item => item.assignmentId.toString() === assignmentId);
      if (itemIndex > -1) {
        grade.assignmentMarks[itemIndex].marks = marks;
        grade.assignmentMarks[itemIndex].gradedAt = new Date();
      } else {
        grade.assignmentMarks.push({ assignmentId, marks, status: 'Graded' });
      }
    }

    await grade.save();

    await logInstructorAction(req.user.id, 'ASSIGNMENT_GRADE_UPDATE', `Graded assignment ID ${assignmentId} for student ID ${studentId} in course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Assignment marks updated successfully',
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Save/update project marks for a student
 * @route   PUT /api/courses/:id/grades/project
 * @access  Private (Instructor only)
 */
exports.updateProjectGrade = async (req, res, next) => {
  try {
    const { studentId, projectId, marks } = req.body;
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let grade = await Grade.findOne({ student: studentId, course: courseId });
    if (!grade) {
      grade = new Grade({
        student: studentId,
        course: courseId,
        projectMarks: [{ projectId, marks, status: 'Graded' }]
      });
    } else {
      const itemIndex = grade.projectMarks.findIndex(item => item.projectId.toString() === projectId);
      if (itemIndex > -1) {
        grade.projectMarks[itemIndex].marks = marks;
        grade.projectMarks[itemIndex].gradedAt = new Date();
      } else {
        grade.projectMarks.push({ projectId, marks, status: 'Graded' });
      }
    }

    await grade.save();

    await logInstructorAction(req.user.id, 'PROJECT_GRADE_UPDATE', `Graded project ID ${projectId} for student ID ${studentId} in course "${course.title}"`);

    res.status(200).json({
      success: true,
      message: 'Project marks updated successfully',
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};