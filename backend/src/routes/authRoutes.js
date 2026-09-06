const express = require('express');
const router = express.Router();
const { login, logout, verify } = require('../controllers/authController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/logout', verifyAdmin, logout);
router.get('/verify', verifyAdmin, verify);

module.exports = router;
