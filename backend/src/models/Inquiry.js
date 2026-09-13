const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    trim: true,
    uppercase: true,
    required: false
  },
  propertyTitle: {
    type: String,
    required: false,
    trim: true
  },
  propertyLocation: {
    type: String,
    required: false,
    trim: true
  },
  propertyPrice: {
    type: Number,
    required: false
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  preferredContact: {
    type: String,
    enum: ['whatsapp', 'call', 'either'],
    default: 'whatsapp'
  },
  status: {
    type: String,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
    default: 'NEW'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);
