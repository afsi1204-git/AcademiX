const mongoose = require('mongoose');

// Certificate Schema
const CertificateSchema = new mongoose.Schema(
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
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    certificateId: {
      type: String,
      unique: true,
      required: true,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    score: Number,
    verificationUrl: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
