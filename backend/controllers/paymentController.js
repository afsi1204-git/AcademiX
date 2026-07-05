const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { createOrder, verifyPayment, refundPayment } = require('../utils/razorpayService');
const { sendPaymentConfirmationEmail } = require('../utils/emailService');

/**
 * Create payment order
 * POST /api/payments/create-order
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Get final price (apply discount if applicable)
    const amount = course.discountPrice || course.price;

    // Create Razorpay order
    const razorpayOrder = await createOrder(
      amount,
      'INR',
      `course_${courseId}_${req.user.id}`
    );

    // Create payment record
    const payment = await Payment.create({
      student: req.user.id,
      course: courseId,
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      description: `Payment for ${course.title}`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      paymentId: payment._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment and create enrollment
 * POST /api/payments/verify
 */
exports.verifyPaymentAndEnroll = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Verify payment
    const isVerified = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: payment.course,
      paymentStatus: 'completed',
      paymentId: razorpayPaymentId,
      amountPaid: payment.amount,
      paidAt: new Date(),
    });

    // Increment total students
    const course = await Course.findByIdAndUpdate(
      payment.course,
      { $inc: { totalStudents: 1 } },
      { new: true }
    );

    // Send confirmation email
    await sendPaymentConfirmationEmail(
      req.user.email,
      req.user.name,
      payment.amount,
      course.title
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment successful',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history
 * GET /api/payments/my-payments
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('course', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments (Admin)
 * GET /api/payments
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund payment
 * POST /api/payments/:id/refund
 */
exports.refundPayment_handler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded',
      });
    }

    // Process refund
    await refundPayment(payment.razorpayPaymentId, payment.amount);

    // Update payment status
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = reason || 'No reason provided';
    await payment.save();

    // Update enrollment status
    await Enrollment.findOneAndUpdate(
      { student: payment.student, course: payment.course },
      { status: 'dropped' }
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment statistics (Admin)
 * GET /api/payments/stats
 */
exports.getPaymentStats = async (req, res, next) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paymentsByStatus = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const paymentsByMonth = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        paymentsByStatus,
        paymentsByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};
