const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  preferredDate: {
    type: String,
    required: true,
    trim: true
  },
  preferredTime: {
    type: String,
    required: true,
    trim: true
  },
  visitorsCount: {
    type: String,
    default: '1-2 people'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
