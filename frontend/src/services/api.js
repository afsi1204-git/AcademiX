import apiClient from './apiClient';

/**
 * Authentication API calls
 */
export const authAPI = {
  // Register new user
  register: (data) => apiClient.post('/auth/register', data),

  // Login user
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // Get current user
  getMe: () => apiClient.get('/auth/me'),

  // Update profile
  updateProfile: (data) => apiClient.put('/auth/profile', data),

  // Send email verification
  sendVerificationEmail: () => apiClient.post('/auth/send-verification-email'),

  // Verify email
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),

  // Forgot password
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, data) => apiClient.post(`/auth/reset-password/${token}`, data),

  // Change password
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

/**
 * Course API calls
 */
export const courseAPI = {
  // Get all courses
  getCourses: (params) => apiClient.get('/courses', { params }),

  // Get course by ID
  getCourseById: (id) => apiClient.get(`/courses/${id}`),

  // Create course
  createCourse: (data) => apiClient.post('/courses', data),

  // Update course
  updateCourse: (id, data) => apiClient.put(`/courses/${id}`, data),

  // Delete course
  deleteCourse: (id) => apiClient.delete(`/courses/${id}`),

  // Publish course
  publishCourse: (id, isPublished) => apiClient.patch(`/courses/${id}/publish`, { isPublished }),

  // Add section
  addSection: (id, data) => apiClient.post(`/courses/${id}/sections`, data),

  // Get instructor courses
  getInstructorCourses: () => apiClient.get('/courses/instructor/my-courses'),

  // Add review
  addReview: (courseId, data) => apiClient.post(`/courses/${courseId}/reviews`, data),
};

/**
 * Enrollment API calls
 */
export const enrollmentAPI = {
  // Enroll in course (application form)
  enrollCourse: (payload) => apiClient.post(`/enrollments/apply`, payload),

  // Get my enrollments
  getMyEnrollments: () => apiClient.get('/enrollments/my-courses'),

  // Get enrollment details
  getEnrollment: (id) => apiClient.get(`/enrollments/${id}`),

  // Update progress
  updateProgress: (id, data) => apiClient.put(`/enrollments/${id}/progress`, data),

  // Drop course
  dropCourse: (id) => apiClient.delete(`/enrollments/${id}`),

  // Get course enrollments (instructor)
  getCourseEnrollments: (courseId) => apiClient.get(`/enrollments/course/${courseId}`),
  // Update enrollment application status (instructor)
  updateEnrollmentStatus: (enrollmentId, status) => apiClient.put(`/enrollments/${enrollmentId}/status`, { status }),
};

/**
 * Quiz API calls
 */
export const quizAPI = {
  // Create quiz
  createQuiz: (data) => apiClient.post('/quizzes', data),

  // Get course quizzes
  getCourseQuizzes: (courseId) => apiClient.get(`/quizzes/course/${courseId}`),

  // Get quiz by ID
  getQuiz: (id) => apiClient.get(`/quizzes/${id}`),

  // Update quiz
  updateQuiz: (id, data) => apiClient.put(`/quizzes/${id}`, data),

  // Publish quiz
  publishQuiz: (id) => apiClient.patch(`/quizzes/${id}/publish`),

  // Submit quiz attempt
  submitQuizAttempt: (data) => apiClient.post('/quizzes/attempts/submit', data),

  // Get quiz attempt
  getQuizAttempt: (id) => apiClient.get(`/quizzes/attempts/${id}`),

  // Get student attempts
  getStudentAttempts: () => apiClient.get('/quizzes/student/my-attempts'),
};

/**
 * Payment API calls
 */
export const paymentAPI = {
  // Create payment order
  createPaymentOrder: (courseId) => apiClient.post('/payments/create-order', { courseId }),

  // Verify payment
  verifyPayment: (data) => apiClient.post('/payments/verify', data),

  // Get payment history
  getPaymentHistory: () => apiClient.get('/payments/my-payments'),

  // Get all payments (admin)
  getAllPayments: (params) => apiClient.get('/payments', { params }),

  // Refund payment
  refundPayment: (id, reason) => apiClient.post(`/payments/${id}/refund`, { reason }),

  // Get payment stats
  getPaymentStats: () => apiClient.get('/payments/stats'),
};