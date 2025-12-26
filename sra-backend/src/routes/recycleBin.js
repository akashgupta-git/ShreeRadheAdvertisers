/**
 * Recycle Bin Routes
 */

const express = require('express');
const router = express.Router();
const { Media, Customer, Booking, Tender, TaxRecord } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Get all deleted items (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [deletedMedia, deletedCustomers, deletedBookings, deletedTenders, deletedTaxes] = await Promise.all([
      Media.find({ deleted: true }).select('name type deletedAt'),
      Customer.find({ deleted: true }).select('name company deletedAt'),
      Booking.find({ deleted: true }).populate('mediaId customerId').select('deletedAt'),
      Tender.find({ deleted: true }).select('tenderName tenderNumber deletedAt'),
      TaxRecord.find({ deleted: true }).select('tenderNumber district deletedAt')
    ]);

    const items = [
      ...deletedMedia.map(m => ({ 
        id: m._id, 
        type: 'media', 
        displayName: m.name, 
        subText: m.type, 
        deletedAt: m.deletedAt 
      })),
      ...deletedCustomers.map(c => ({ 
        id: c._id, 
        type: 'customer', 
        displayName: c.name, 
        subText: c.company, 
        deletedAt: c.deletedAt 
      })),
      ...deletedBookings.map(b => ({ 
        id: b._id, 
        type: 'booking', 
        displayName: `Booking #${b._id.toString().slice(-6)}`, 
        subText: '', 
        deletedAt: b.deletedAt 
      })),
      ...deletedTenders.map(t => ({ 
        id: t._id, 
        type: 'tender', 
        displayName: t.tenderName, 
        subText: t.tenderNumber, 
        deletedAt: t.deletedAt 
      })),
      ...deletedTaxes.map(t => ({ 
        id: t._id, 
        type: 'tax', 
        displayName: `Tax: ${t.tenderNumber}`, 
        subText: t.district, 
        deletedAt: t.deletedAt 
      }))
    ];

    res.json(items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recycle bin' });
  }
});

// Restore item (protected)
router.post('/restore', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.body;
    
    const models = { 
      media: Media, 
      customer: Customer, 
      booking: Booking, 
      tender: Tender, 
      tax: TaxRecord 
    };
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    
    await Model.findByIdAndUpdate(id, { deleted: false, deletedAt: null });
    res.json({ message: 'Item restored' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore item' });
  }
});

// Permanently delete item (protected)
router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.body;
    
    const models = { 
      media: Media, 
      customer: Customer, 
      booking: Booking, 
      tender: Tender, 
      tax: TaxRecord 
    };
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    
    await Model.findByIdAndDelete(id);
    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

module.exports = router;