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
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit contact form' });
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
router.put('/:id/status', authMiddleware, async (req, res) => {
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

module.exports = router;
