/**
 * Contact/Lead Routes
 */

const express = require('express');
const router = express.Router();
const { Contact } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Submit contact form (public)
router.post('/', async (req, res) => {
  try {
    console.log("Data received from frontend:", req.body); // Check what's arriving
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error("DETAILED SUBMISSION ERROR:", error); // This shows in Render Logs
    res.status(500).json({ 
      message: 'Failed to submit contact form',
      error: error.message // Sends error back to frontend for debugging
    });
  }
});

// Get all contacts (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Contact.countDocuments(filter)
    ]);

    res.json({ data: contacts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// Get single contact (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contact' });
  }
});

// Update contact status (protected)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { status, notes }, 
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contact status' });
  }
});

// Get inquiries separated by status
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get New (Unattended) Inquiries
    const pending = await Contact.find({ attended: false }).sort({ createdAt: -1 });

    // Get 10 most recent Attended Inquiries
    const recentAttended = await Contact.find({ attended: true })
      .sort({ attendedAt: -1 })
      .limit(10);

    res.json({ pending, recentAttended });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// Mark as Attended
router.patch('/:id/attend', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { 
        attended: true, 
        attendedAt: new Date(),
        status: 'Contacted' 
      }, 
      { new: true }
    );
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Add this route to allow reverting an inquiry to unattended status
router.patch('/:id/unattend', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { 
        attended: false, 
        attendedAt: null,
        status: 'Pending' // Reset status to pending
      }, 
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Revert failed' });
  }
});

module.exports = router;