const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Create quiz (Instructor only)
 * POST /api/quizzes
 */
exports.createQuiz = async (req, res, next) => {
  try {
    const { courseId, title, description, questions, totalMarks, passingMarks, timeLimit } = req.body;

    if (!courseId || !title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      description,
      questions,
      totalMarks: totalMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      passingMarks: passingMarks || 60,
      timeLimit,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quizzes for a course
 * GET /api/quizzes/course/:courseId
 */
exports.getCourseQuizzes = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ course: courseId, isPublished: true }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz details
 * GET /api/quizzes/:id
 */
exports.getQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update quiz
 * PUT /api/quizzes/:id
 */
exports.updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish quiz
 * PATCH /api/quizzes/:id/publish
 */
exports.publishQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndUpdate(id, { isPublished: true }, { new: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz published successfully',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit quiz attempt
 * POST /api/quiz-attempts/submit
 */
exports.submitQuizAttempt = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quiz ID and answers',
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Calculate score
    let marksObtained = 0;
    const submittedAnswers = [];

    answers.forEach((answer) => {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);

      if (question) {
        const isCorrect = answer.answer === question.correctAnswer;
        marksObtained += isCorrect ? (question.marks || 1) : 0;

        submittedAnswers.push({
          questionId: question._id,
          answer: answer.answer,
          isCorrect,
          marksObtained: isCorrect ? (question.marks || 1) : 0,
        });
      }
    });

    const percentage = (marksObtained / quiz.totalMarks) * 100;
    const isPassed = marksObtained >= quiz.passingMarks;

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      student: req.user.id,
      quiz: quizId,
      course: quiz.course,
      answers: submittedAnswers,
      marksObtained,
      totalMarks: quiz.totalMarks,
      percentage,
      isPassed,
      status: 'submitted',
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz attempt results
 * GET /api/quiz-attempts/:id
 */
exports.getQuizAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attempt = await QuizAttempt.findById(id).populate('quiz student');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found',
      });
    }

    // Check authorization
    if (attempt.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student quiz attempts
 * GET /api/quiz-attempts/student/my-attempts
 */
exports.getStudentAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate('quiz course')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};
