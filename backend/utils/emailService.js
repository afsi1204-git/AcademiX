const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send welcome email to new user
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to EduHub - Your Learning Journey Begins!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for signing up on EduHub.</p>
        <p>Your account has been created successfully.</p>
        <p>Click here to verify your email and get started:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email">Verify Email</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

/**
 * Send email verification email
 */
exports.sendEmailVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - EduHub',
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - EduHub',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

/**
 * Send enrollment confirmation email
 */
exports.sendEnrollmentEmail = async (email, studentName, courseName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Successfully Enrolled in ${courseName} - EduHub`,
      html: `
        <h2>Enrollment Confirmation</h2>
        <p>Hi ${studentName},</p>
        <p>You have successfully enrolled in <strong>${courseName}</strong>.</p>
        <p>Start learning now:</p>
        <a href="${process.env.FRONTEND_URL}/courses/${courseName}">Go to Course</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending enrollment email:', error);
  }
};

/**
 * Send certificate email
 */
exports.sendCertificateEmail = async (email, studentName, courseName, certificateUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Certificate Issued: ${courseName} - EduHub`,
      html: `
        <h2>Congratulations!</h2>
        <p>Hi ${studentName},</p>
        <p>You have successfully completed <strong>${courseName}</strong>.</p>
        <p>Your certificate of completion is ready:</p>
        <a href="${certificateUrl}">Download Certificate</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending certificate email:', error);
  }
};

/**
 * Send course update email to enrolled students
 */
exports.sendCourseUpdateEmail = async (emails, courseName, updateMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emails.join(','),
      subject: `Course Update: ${courseName} - EduHub`,
      html: `
        <h2>Course Update</h2>
        <p><strong>${courseName}</strong> has been updated:</p>
        <p>${updateMessage}</p>
        <a href="${process.env.FRONTEND_URL}/courses">View Course</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending course update email:', error);
  }
};

/**
 * Send payment confirmation email
 */
exports.sendPaymentConfirmationEmail = async (email, studentName, amount, courseName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Payment Confirmation - EduHub',
      html: `
        <h2>Payment Received</h2>
        <p>Hi ${studentName},</p>
        <p>We have received your payment of ₹${amount} for <strong>${courseName}</strong>.</p>
        <p>Thank you for your purchase!</p>
        <a href="${process.env.FRONTEND_URL}/my-courses">View Your Courses</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending payment email:', error);
  }
};

/**
 * Send teacher approval email
 */
exports.sendTeacherApprovalEmail = async (email, teacherName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Teacher Account Has Been Approved - EduHub',
      html: `
        <h2>Welcome, Teacher!</h2>
        <p>Hi ${teacherName},</p>
        <p>Great news! Your teacher account on EduHub has been <strong>approved</strong> by the administrator.</p>
        <p>You can now:</p>
        <ul>
          <li>Create and manage your courses</li>
          <li>Add course materials and assignments</li>
          <li>Create quizzes and assessments</li>
          <li>Monitor student progress</li>
          <li>Access your teacher dashboard</li>
        </ul>
        <p>Click below to access your teacher dashboard:</p>
        <a href="${process.env.FRONTEND_URL}/teacher/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Teacher Dashboard
        </a>
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending teacher approval email:', error);
  }
};

/**
 * Send teacher rejection email
 */
exports.sendTeacherRejectionEmail = async (email, teacherName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Teacher Application Has Been Reviewed - EduHub',
      html: `
        <h2>Application Status Update</h2>
        <p>Hi ${teacherName},</p>
        <p>Thank you for applying to become a teacher on EduHub. After careful review, your application has been <strong>rejected</strong> at this time.</p>
        <p>This may be due to various reasons. You can:</p>
        <ul>
          <li>Contact our support team for feedback on your application</li>
          <li>Reapply after addressing any concerns</li>
          <li>Reach out to us with any questions</li>
        </ul>
        <p>We encourage you to reach out if you'd like to discuss your application further.</p>
        <p>Best regards,<br>EduHub Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending teacher rejection email:', error);
  }
};
