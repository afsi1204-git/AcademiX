/**
 * Validation utilities for input validation
 */

/**
 * Validate email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Password must contain: uppercase, lowercase, number, special character
 * Minimum 8 characters
 */
exports.isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number (Indian format)
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL
 */
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate MongoDB ObjectId
 */
exports.isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate course data
 */
exports.validateCourseData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Course title is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Course description is required';
  }

  if (!data.category || data.category.trim() === '') {
    errors.category = 'Course category is required';
  }

  if (data.price < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (data.discountPrice && data.discountPrice > data.price) {
    errors.discountPrice = 'Discount price cannot be greater than price';
  }

  return errors;
};

/**
 * Validate quiz data
 */
exports.validateQuizData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Quiz title is required';
  }

  if (!data.questions || data.questions.length === 0) {
    errors.questions = 'Quiz must have at least one question';
  }

  if (data.passingMarks < 0 || data.passingMarks > 100) {
    errors.passingMarks = 'Passing marks must be between 0 and 100';
  }

  return errors;
};

/**
 * Sanitize user input
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * Validate enrollment data
 */
exports.validateEnrollmentData = (data) => {
  const errors = {};

  if (!data.studentId || data.studentId.trim() === '') {
    errors.studentId = 'Student ID is required';
  }

  if (!data.courseId || data.courseId.trim() === '') {
    errors.courseId = 'Course ID is required';
  }

  return errors;
};
