const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const verifyAdmin = require('../middleware/verifyAdmin');

// POST /api/inquiries (Public - client submitting an inquiry)
router.post('/', async (req, res, next) => {
  try {
    const { 
      propertyId, 
      propertyTitle, 
      propertyLocation, 
      propertyPrice, 
      clientName, 
      name,
      phone, 
      email, 
      message, 
      preferredContact 
    } = req.body;

    const finalName = (clientName || name || '').trim();
    if (!finalName || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required.' });
    }

    const inquiry = new Inquiry({
      propertyId: propertyId ? String(propertyId).trim().toUpperCase() : null,
      propertyTitle: propertyTitle || '',
      propertyLocation: propertyLocation || '',
      propertyPrice: propertyPrice ? Number(propertyPrice) : undefined,
      clientName: finalName,
      phone: phone.trim(),
      email: (email || '').trim(),
      message: (message || '').trim(),
      preferredContact: preferredContact || 'whatsapp'
    });

    await inquiry.save();
    return res.status(201).json({ success: true, data: inquiry, message: 'Inquiry submitted successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/inquiries (Admin - retrieve inquiries list)
router.get('/', verifyAdmin, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/inquiries/:id/status (Admin - update status)
router.patch('/:id/status', verifyAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }
    return res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inquiries/:id (Admin - delete inquiry)
router.delete('/:id', verifyAdmin, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
