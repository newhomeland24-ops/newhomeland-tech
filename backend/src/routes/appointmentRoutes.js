const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const verifyAdmin = require('../middleware/verifyAdmin');

// POST /api/appointments (Public - client booking a site visit)
router.post('/', async (req, res, next) => {
  try {
    const { 
      propertyId, 
      propertyTitle, 
      propertyLocation, 
      clientName, 
      name,
      phone, 
      email, 
      preferredDate, 
      preferredTime, 
      visitorsCount, 
      notes 
    } = req.body;

    const finalName = (clientName || name || '').trim();
    if (!finalName || !phone || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Name, phone number, date, and time slot are required.' });
    }

    const appointment = new Appointment({
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || '',
      propertyLocation: propertyLocation || '',
      clientName: finalName,
      phone: phone.trim(),
      email: (email || '').trim(),
      preferredDate: preferredDate.trim(),
      preferredTime: preferredTime.trim(),
      visitorsCount: visitorsCount || '1-2 people',
      notes: (notes || '').trim()
    });

    await appointment.save();
    return res.status(201).json({ success: true, data: appointment, message: 'Site visit appointment requested successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/appointments (Admin - view all site visits)
router.get('/', verifyAdmin, async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/appointments/:id/status (Admin - confirm/cancel)
router.patch('/:id/status', verifyAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    return res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/appointments/:id (Admin - delete)
router.delete('/:id', verifyAdmin, async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    return res.json({ success: true, message: 'Appointment deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
