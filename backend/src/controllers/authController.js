const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const AdminOtp = require('../models/AdminOtp');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Normalizes email address to lowercase and trimmed string.
 */
const normalizeEmail = (email) => (email || '').trim().toLowerCase();

/**
 * POST /api/auth/admin/send-otp
 * Generates and sends a 6-digit OTP to the authorized administrator email.
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const submittedEmail = normalizeEmail(email);
  const authorizedAdminEmail = normalizeEmail(process.env.ADMIN_NOTIFICATION_EMAIL);

  // Strict authorization check: Only configured admin email is allowed
  if (!authorizedAdminEmail || submittedEmail !== authorizedAdminEmail) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized email address.',
    });
  }

  // 1) Generate cryptographically secure 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // 2) Hash the OTP using SHA-256
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  // 3) Clear prior pending OTP records for this email and save the new hash
  await AdminOtp.deleteMany({ email: submittedEmail });
  await AdminOtp.create({
    email: submittedEmail,
    otpHash,
    createdAt: new Date(),
  });

  // 4) Dispatch email via Resend SDK
  const rawFrom = process.env.FROM_EMAIL || 'notifications@newhomedevelopers.in';
  const fromAddress = rawFrom.includes('<') ? rawFrom : `NewHomeLand <${rawFrom}>`;

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: [submittedEmail],
    subject: 'Your Admin Portal One-Time Verification Code',
    text: `Your Admin Portal verification code is: ${otp}. This code is valid for 5 minutes. If you did not request this, please ignore.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #0f172a;">
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">Admin Portal Secure Login</h2>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.5;">Use the one-time verification code below to sign in to the NewHomeLand Admin Portal.</p>
        <div style="margin: 24px 0; padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; font-family: monospace;">${otp}</span>
        </div>
        <p style="margin: 0 0 16px; font-size: 13px; color: #64748b; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">If you did not request this login attempt, no further action is required.</p>
      </div>
    `,
  });

  if (emailError) {
    logger.error('Failed to dispatch OTP email via Resend', { error: emailError.message || emailError });
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please check email configuration.',
    });
  }

  // 5) ZERO LEAK RULE: Never return the plain OTP, hashed OTP, or token
  return res.status(200).json({
    success: true,
    message: 'Verification code sent to your email.',
  });
});

/**
 * POST /api/auth/admin/verify-otp
 * Verifies submitted OTP, consumes it, and issues an admin JWT.
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and verification code are required.',
    });
  }

  const submittedEmail = normalizeEmail(email);
  const authorizedAdminEmail = normalizeEmail(process.env.ADMIN_NOTIFICATION_EMAIL);

  if (!authorizedAdminEmail || submittedEmail !== authorizedAdminEmail) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired verification code.',
    });
  }

  // Compute SHA-256 hash of submitted OTP
  const cleanOtp = String(otp).trim();
  const submittedOtpHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

  // Query matching record
  const otpRecord = await AdminOtp.findOne({
    email: submittedEmail,
    otpHash: submittedOtpHash,
  });

  if (!otpRecord) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired verification code.',
    });
  }

  // 1) Immediately delete matching record(s) to block replay attempts
  await AdminOtp.deleteMany({ email: submittedEmail });

  // 2) Issue admin JWT (3 hours validity for inactivity auto-logout enforcement)
  const token = jwt.sign(
    { role: 'admin', email: submittedEmail },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );

  // Also set httpOnly cookie for cross-compatibility (3 hours expiry)
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 3 * 60 * 60 * 1000, // 3 hours
    path: '/',
  });

  // 3) Return HTTP 200 with token
  return res.status(200).json({
    success: true,
    token,
    message: 'Login successful.',
  });
});

/**
 * POST /api/auth/admin/logout
 * Completely purges adminToken cookie
 */
const logout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  };
  res.cookie('adminToken', '', cookieOptions);
  res.clearCookie('adminToken', cookieOptions);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/admin/verify
 */
const verify = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, authenticated: true });
});

module.exports = {
  sendOtp,
  verifyOtp,
  logout,
  verify,
};
