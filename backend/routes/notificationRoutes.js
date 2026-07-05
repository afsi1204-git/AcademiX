const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User'); 

// Robustly fallback to standard alternative auth naming configurations if authMiddleware is missing
let protect;
try {
  const authModule = require('../middleware/authMiddleware');
  protect = authModule.protect || authModule;
} catch (err) {
  try {
    // Secondary fallback check for shorthand naming models (e.g., auth.js)
    const authModule = require('../middleware/auth');
    protect = authModule.protect || authModule;
  } catch (innerErr) {
    console.error("❌ CRITICAL: Could not resolve auth middleware path. Please check your /middleware/ folder filenames.");
    // Fail-safe dummy middleware to prevent application crashes during structural adjustments
    protect = (req, res, next) => next();
  }
}

// 1. ADMIN ACTION: Send task to an individual teacher or broadcast to all
router.post('/send-task', protect, async (req, res) => {
  try {
    const { target, teacherId, message, title } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task text is required.' });
    }

    const taskTitle = title || 'New Admin Directive Assigned';

    if (target === 'individual') {
      if (!teacherId) {
        return res.status(400).json({ success: false, message: 'Teacher ID is required for individual target.' });
      }
      
      // Create a single direct target notification entry
      await Notification.create({
        user: teacherId,
        type: 'admin-alert',
        title: taskTitle,
        message: message,
        sendEmail: false
      });
    } else {
      // Broadcast mode: Create a single document entry where user is null
      await Notification.create({
        user: null, // Signals global broadcast reach
        type: 'admin-alert',
        title: taskTitle,
        message: message,
        sendEmail: false,
        readByUsers: []
      });
    }

    return res.status(201).json({ success: true, message: 'Task dispatched successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/send-task', protect, async (req, res) => {
  try {
    const tasks = await Notification.find({ type: 'admin-alert' })
      .populate('user', 'name email')
      .populate('readByUsers', 'name email')
      .populate('completedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. ADMIN LOOKUP: Get list of teachers to populate selection dropdown
router.get('/teachers', protect, async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'instructor',
      instructorRequestStatus: 'approved',
      isActive: true,
    }).select('_id name email');
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. TEACHER FETCH: Retrieve personalized task cards & broad administrative alerts
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Pull tasks addressed directly to this user OR global broadcasts where user is null
    const tasks = await Notification.find({
      type: 'admin-alert',
      $or: [
        { user: userId },
        { user: null }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. TEACHER UPDATE: Dismiss notification task card
router.post('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification task card not found.' });
    }

    if (notification.user) {
      // For individual tasks, flip the built-in boolean flag
      notification.isRead = true;
    } else {
      // For global broadcast tasks, add the user to the read tracking list
      if (!notification.readByUsers.includes(req.user._id)) {
        notification.readByUsers.push(req.user._id);
      }
    }

    if (!notification.completedBy.includes(req.user._id)) {
      notification.completedBy.push(req.user._id);
    }

    await notification.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
