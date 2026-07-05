const express = require('express');
const User = require('../models/User');
const {
  register,
  login,
  getMe,
  updateProfile,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const InstructorLog = require('../models/InstructorLog');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/send-verification-email', protect, sendVerificationEmail);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

router.get('/pending-instructors', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingList = await User.find({
      role: 'instructor',
      instructorRequestStatus: 'pending',
    })
      .select('-password')
      .sort('-instructorRequestDate');

    res.status(200).json({ success: true, pendingList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/instructors', protect, authorize('admin'), async (req, res) => {
  try {
    const instructors = await User.find({
      role: 'instructor',
      instructorRequestStatus: 'approved',
      isActive: true,
    })
      .select('-password')
      .sort('name');

    res.status(200).json({ success: true, instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/approve-instructor', protect, authorize('admin'), async (req, res) => {
  try {
    const { instructorId, action } = req.body;

    if (!instructorId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an instructorId and a valid action.',
      });
    }

    const instructor = await User.findOne({ _id: instructorId, role: 'instructor' });
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor request not found.' });
    }

    instructor.instructorRequestStatus = action === 'approve' ? 'approved' : 'rejected';
    instructor.isActive = action === 'approve';
    await instructor.save();

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Instructor approved successfully.' : 'Instructor request rejected.',
      user: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
        instructorRequestStatus: instructor.instructorRequestStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(['/instructors', '/add-instructor'], protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a full name, email address, and a temporary password.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A registered account with this email address already exists.',
      });
    }

    const instructor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'instructor',
      instructorRequestStatus: 'approved',
      isEmailVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Instructor successfully registered to the AcademiX system workspace.',
      user: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
        instructorRequestStatus: instructor.instructorRequestStatus,
      },
    });
  } catch (error) {
    console.error('[ADMIN API ERROR] Instructor placement failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete('/remove-instructor/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const instructor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'instructor' },
      { instructorRequestStatus: 'rejected', isActive: false },
      { new: true }
    ).select('-password');

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }

    res.status(200).json({ success: true, message: 'Instructor access revoked.', user: instructor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await InstructorLog.find()
      .populate('instructor', 'name email')
      .sort('-createdAt')
      .limit(200);

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
