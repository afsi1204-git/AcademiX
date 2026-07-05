const mongoose = require('mongoose');

// Payment Schema for Razorpay integration
const PaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: String,
    transactionId: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
