// backend/utils/razorpayService.js
const crypto = require('crypto');

// Completely removed Razorpay initialization to stop crashing on Render.
console.log('🔄 Razorpay dependency dropped. Application is running in 100% Free Auto-Enrollment Mode.');

/**
 * Create Mock Razorpay order
 */
exports.createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    // Instantly returns a fake structured object so your enrollment controller doesn't break
    return {
      id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
      entity: 'order',
      amount: 0,
      amount_paid: 0,
      amount_due: 0,
      currency: currency,
      receipt: receipt,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Error creating mock order:', error);
    throw error;
  }
};

/**
 * Verify payment
 */
exports.verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature, secret) => {
  // Always return true to automatically authorize student access instantly
  return true;
};

/**
 * Fetch payment details
 */
exports.fetchPayment = async (paymentId) => {
  try {
    return { id: paymentId, status: 'captured', amount: 0 };
  } catch (error) {
    console.error('Error fetching mock payment:', error);
    throw error;
  }
};

/**
 * Refund payment
 */
exports.refundPayment = async (paymentId, amount) => {
  try {
    return { id: `rfnd_${paymentId}`, status: 'processed' };
  } catch (error) {
    console.error('Error refunding mock payment:', error);
    throw error;
  }
};

/**
 * Create subscription
 */
exports.createSubscription = async (planId, customerNotify, quantity, totalCount) => {
  try {
    return { id: `sub_mock_${Date.now()}`, status: 'active' };
  } catch (error) {
    console.error('Error creating mock subscription:', error);
    throw error;
  }
};