const express = require('express');
const {
  createPaymentOrder,
  verifyPaymentAndEnroll,
  getPaymentHistory,
  getAllPayments,
  refundPayment_handler,
  getPaymentStats,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPaymentAndEnroll);
router.get('/my-payments', protect, getPaymentHistory);

// Admin routes
router.get('/', protect, authorize('admin'), getAllPayments);
router.post('/:id/refund', protect, authorize('admin'), refundPayment_handler);
router.get('/stats', protect, authorize('admin'), getPaymentStats);

module.exports = router;
