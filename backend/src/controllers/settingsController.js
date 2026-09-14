const BrokerSetting = require('../models/BrokerSetting');

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
 * @desc    Update broker & site settings
 * @route   PUT /api/admin/settings & PUT /api/settings
 * @access  Private (Admin)
 */
const updateSettings = async (req, res, next) => {
  try {
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
      'maintenanceMessage'
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
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
  updateSettings
};
