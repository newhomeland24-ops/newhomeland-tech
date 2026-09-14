const mongoose = require('mongoose');

const brokerSettingSchema = new mongoose.Schema({
  // 1. Company Identity
  business_name: { 
    type: String, 
    default: 'NewHomeDevelopers',
    trim: true
  },
  tagline: { 
    type: String, 
    default: 'Your Ground. Your Future.',
    trim: true
  },

  // 2. Direct Contact Channels
  phone: { 
    type: String, 
    default: '+91 98765 43210',
    trim: true
  },
  whatsapp: { 
    type: String, 
    default: '+919876543210',
    trim: true
  },
  email: { 
    type: String, 
    default: 'contact@newhomedevelopers.com',
    trim: true,
    lowercase: true
  },
  address: { 
    type: String, 
    default: 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR',
    trim: true
  },
  business_hours: { 
    type: String, 
    default: 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment',
    trim: true
  },

  // 3. Homepage Hero & About Texts
  hero_title: { 
    type: String, 
    default: 'Find Your Perfect Plot, Villa & Dream Home',
    trim: true
  },
  hero_subtitle: { 
    type: String, 
    default: 'Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.',
    trim: true
  },
  about_summary: { 
    type: String, 
    default: 'Your trusted partner in premium land and real estate brokerage. Your Ground. Your Future.',
    trim: true
  },
  about_full: { 
    type: String, 
    default: 'We are dedicated to providing the best real estate services, ensuring 100% legal title clearance and securing your future with verified plots, villas, and commercial land.',
    trim: true
  },
  footer_text: { 
    type: String, 
    default: '© 2026 NewHomeDevelopers Brokerage. All rights reserved.',
    trim: true
  },

  // System Maintenance Controls
  isMaintenance: { 
    type: Boolean, 
    default: false 
  },
  maintenanceMessage: { 
    type: String, 
    default: 'Our website is currently undergoing scheduled maintenance. Please connect with our team directly on WhatsApp for verified properties, floor plans, and site visits.',
    trim: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Singleton Pattern: Return existing settings or create document with default schema values
brokerSettingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('BrokerSetting', brokerSettingSchema);
