const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  isMaintenance: { type: Boolean, default: false },
  maintenanceMessage: { 
    type: String, 
    default: "Our website is currently undergoing scheduled maintenance. Please connect with our team directly on WhatsApp for verified properties, floor plans, and site visits." 
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
