const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  isMaintenance: { type: Boolean, default: false },
  maintenanceMessage: { 
    type: String, 
    default: "NewHomeLand catalog is currently undergoing scheduled maintenance. Please connect directly with our broker on WhatsApp." 
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
