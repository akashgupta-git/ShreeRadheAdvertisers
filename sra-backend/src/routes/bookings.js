/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const { Booking, Customer, Media } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Get all bookings (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { customerId, mediaId, status, paymentStatus, page = 1, limit = 50 } = req.query;
    
    const filter = { deleted: false };
    if (customerId) filter.customerId = customerId;
    if (mediaId) filter.mediaId = mediaId;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('mediaId')
        .populate('customerId')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(filter)
    ]);

    res.json({ data: bookings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get single booking (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('mediaId')
      .populate('customerId');
    if (!booking || booking.deleted) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// Get bookings by customer (protected)
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      customerId: req.params.customerId, 
      deleted: false 
    })
      .populate('mediaId')
      .sort({ createdAt: -1 });
    
    res.json({ data: bookings, total: bookings.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer bookings' });
  }
});

// Create booking (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    
    // Update customer stats
    await Customer.findByIdAndUpdate(req.body.customerId, {
      $inc: { totalBookings: 1 }
    });
    
    // Update media status and booked dates
    await Media.findByIdAndUpdate(req.body.mediaId, { 
      status: 'Booked',
      $push: { 
        bookedDates: { 
          start: req.body.startDate, 
          end: req.body.endDate, 
          bookingId: booking._id 
        } 
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Update booking (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Delete booking - soft delete (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { deleted: true, deletedAt: new Date() }, 
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

module.exports = router;