const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes TTL index in seconds
  },
});

const AdminOtp = mongoose.model('AdminOtp', adminOtpSchema);

module.exports = AdminOtp;
