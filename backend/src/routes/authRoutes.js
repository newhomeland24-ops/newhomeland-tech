const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, logout, verify } = require('../controllers/authController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { loginLimiter } = require('../middleware/rateLimiter');

// OTP-based Admin Authentication Routes
router.post('/send-otp', loginLimiter, sendOtp);
router.post('/verify-otp', loginLimiter, verifyOtp);
router.post('/logout', verifyAdmin, logout);
router.get('/verify', verifyAdmin, verify);

module.exports = router;
