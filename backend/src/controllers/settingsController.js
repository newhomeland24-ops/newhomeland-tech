const BrokerSetting = require('../models/BrokerSetting');
const crypto = require('crypto');
const AdminOtp = require('../models/AdminOtp');
const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @desc    Get active broker & site settings
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await BrokerSetting.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
      // Spread object for backward compatibility with components reading top-level fields
      ...settings.toObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request OTP to update broker & site settings
 * @route   POST /api/admin/settings/request-otp
 * @access  Private (Admin)
 */
const requestSettingsOtp = async (req, res, next) => {
  try {
    const adminEmail = req.admin.email;
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await AdminOtp.deleteMany({ email: adminEmail });
    await AdminOtp.create({
      email: adminEmail,
      otpHash,
      createdAt: new Date(),
    });

    const rawFrom = process.env.FROM_EMAIL || 'notifications@newhomedevelopers.in';
    const fromAddress = rawFrom.includes('<') ? rawFrom : `NewHomeLand <${rawFrom}>`;

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [adminEmail],
      subject: 'Verify Settings Update',
      text: `Your OTP to update broker settings is: ${otp}. This code is valid for 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verify Settings Update</h2>
          <p>Your one-time verification code to update broker settings is:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f0f0f0; display: inline-block; letter-spacing: 2px;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    if (emailError) {
      logger.error('Failed to send OTP email', { error: emailError.message || emailError });
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email.',
      });
    }

    return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update broker & site settings
 * @route   PUT /api/admin/settings & PUT /api/settings
 * @access  Private (Admin)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required to update settings.' });
    }

    const adminEmail = req.admin.email;
    const submittedOtpHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
    const otpRecord = await AdminOtp.findOne({ email: adminEmail, otpHash: submittedOtpHash });

    if (!otpRecord) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // OTP is valid, consume it
    await AdminOtp.deleteMany({ email: adminEmail });

    const allowedFields = [
      'business_name',
      'tagline',
      'phone',
      'whatsapp',
      'email',
      'address',
      'business_hours',
      'hero_title',
      'hero_subtitle',
      'about_summary',
      'about_full',
      'footer_text',
      'isMaintenance',
      'maintenanceMessage',
      'propertyTypes',
      'areaUnits',
      'amenities',
      'facebook',
      'instagram'
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'facebook' || field === 'instagram') {
          updateData[`social_links.${field}`] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    updateData.updatedAt = new Date();

    const updatedSettings = await BrokerSetting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
      ...updatedSettings.toObject()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  requestSettingsOtp
};
