const express = require('express');
const { sendOtp, verifyOtp, logout, verify } = require('../controllers/authController');
const verifyAdmin = require('../middleware/verifyAdmin');
const validate = require('../middleware/validate');
const { requestOtpSchema, verifyOtpSchema } = require('../schemas/authValidation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests from this IP, please try again later.' }
});

router.post('/send-otp', otpLimiter, validate(requestOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/logout', verifyAdmin, logout);
router.get('/verify', verifyAdmin, verify);

module.exports = router;
