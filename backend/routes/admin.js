// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendTeacherApprovalEmail, sendTeacherRejectionEmail } = require('../utils/emailService');

/**
 * @desc    Get all pending teacher requests
 * @route   GET /api/admin/pending-teachers
 * @access  Private/Admin
 */
router.get('/pending-teachers', protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'instructor', 
      instructorRequestStatus: 'pending' 
    }).select('-password');
    
    res.status(200).json({ 
      success: true, 
      count: pending.length,
      data: pending 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/**
 * @desc    Get all approved teachers
 * @route   GET /api/admin/approved-teachers
 * @access  Private/Admin
 */
router.get('/approved-teachers', protect, adminOnly, async (req, res) => {
  try {
    const approved = await User.find({ 
      role: 'instructor', 
      instructorRequestStatus: 'approved' 
    }).select('-password');
    
    res.status(200).json({ 
      success: true, 
      count: approved.length,
      data: approved 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/**
 * @desc    Get all rejected teachers
 * @route   GET /api/admin/rejected-teachers
 * @access  Private/Admin
 */
router.get('/rejected-teachers', protect, adminOnly, async (req, res) => {
  try {
    const rejected = await User.find({ 
      role: 'instructor', 
      instructorRequestStatus: 'rejected' 
    }).select('-password');
    
    res.status(200).json({ 
      success: true, 
      count: rejected.length,
      data: rejected 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/**
 * @desc    Approve or Reject a teacher request
 * @route   PATCH /api/admin/teacher-request/:id
 * @access  Private/Admin
 */
router.patch('/teacher-request/:id', protect, adminOnly, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const { id } = req.params;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide action: approve or reject' 
      });
    }

    const teacher = await User.findById(id);

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    if (teacher.instructorRequestStatus !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This request is not pending' 
      });
    }

    if (action === 'approve') {
      teacher.instructorRequestStatus = 'approved';
      await teacher.save();

      // Send approval email
      try {
        await sendTeacherApprovalEmail(teacher.email, teacher.name);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Teacher approved successfully',
        data: teacher
      });
    } else if (action === 'reject') {
      teacher.instructorRequestStatus = 'rejected';
      await teacher.save();

      // Send rejection email
      try {
        await sendTeacherRejectionEmail(teacher.email, teacher.name);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Teacher request rejected',
        data: teacher
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;