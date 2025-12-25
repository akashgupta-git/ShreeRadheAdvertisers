/**
 * Compliance Routes - Tenders and Tax Records
 */

const express = require('express');
const router = express.Router();
const { Tender, TaxRecord } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Get all tenders (protected)
router.get('/tenders', authMiddleware, async (req, res) => {
  try {
    const tenders = await Tender.find({ deleted: false })
      .populate('mediaIds')
      .sort({ endDate: 1 });
    
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const tendersWithStatus = tenders.map(t => {
      let status = 'Active';
      if (t.endDate < now) status = 'Expired';
      else if (t.endDate <= thirtyDaysLater) status = 'Expiring Soon';
      return { ...t.toObject(), status };
    });
    
    res.json({ data: tendersWithStatus, total: tendersWithStatus.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tenders' });
  }
});

// Create tender (protected)
router.post('/tenders', authMiddleware, async (req, res) => {
  try {
    const tender = new Tender(req.body);
    await tender.save();
    res.status(201).json(tender);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tender' });
  }
});

// Get all tax records (protected)
router.get('/taxes', authMiddleware, async (req, res) => {
  try {
    const taxes = await TaxRecord.find({ deleted: false })
      .populate('tenderId')
      .sort({ dueDate: 1 });
    
    const now = new Date();
    const taxesWithStatus = taxes.map(t => {
      let status = t.status;
      if (status !== 'Paid' && t.dueDate < now) status = 'Overdue';
      return { ...t.toObject(), status };
    });
    
    res.json({ data: taxesWithStatus, total: taxesWithStatus.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tax records' });
  }
});

// Pay tax (protected)
router.post('/taxes/:id/pay', authMiddleware, async (req, res) => {
  try {
    const { receiptUrl } = req.body;
    const tax = await TaxRecord.findByIdAndUpdate(
      req.params.id, 
      { status: 'Paid', paymentDate: new Date(), receiptUrl }, 
      { new: true }
    );
    
    if (!tax) {
      return res.status(404).json({ message: 'Tax record not found' });
    }
    res.json(tax);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tax payment' });
  }
});

// Compliance stats (protected)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [activeTenders, expiringTenders, pendingTaxes, overdueTaxes, taxPaid, taxLiability] = await Promise.all([
      Tender.countDocuments({ deleted: false, endDate: { $gte: now } }),
      Tender.countDocuments({ deleted: false, endDate: { $gte: now, $lte: thirtyDaysLater } }),
      TaxRecord.countDocuments({ deleted: false, status: 'Pending' }),
      TaxRecord.countDocuments({ deleted: false, status: { $ne: 'Paid' }, dueDate: { $lt: now } }),
      TaxRecord.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      TaxRecord.aggregate([{ $match: { status: { $ne: 'Paid' } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    res.json({
      totalActiveTenders: activeTenders,
      expiringTenders,
      pendingTaxes,
      overdueTaxes,
      totalTaxPaid: taxPaid[0]?.total || 0,
      totalTaxLiability: taxLiability[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch compliance stats' });
  }
});

module.exports = router;
