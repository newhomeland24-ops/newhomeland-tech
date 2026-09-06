const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  let settings = await Settings.findOne({});
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json(settings);
};

const updateSettings = async (req, res) => {
  let settings = await Settings.findOne({});
  if (!settings) {
    settings = await Settings.create({});
  }

  const { isMaintenance, maintenanceMessage } = req.body;
  if (isMaintenance !== undefined) settings.isMaintenance = isMaintenance;
  if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;
  settings.updatedAt = new Date();

  const updatedSettings = await settings.save();
  res.status(200).json(updatedSettings);
};

module.exports = {
  getSettings,
  updateSettings
};
