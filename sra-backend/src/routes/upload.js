const express = require('express');
const router = express.Router();
const fs = require('fs');
const { upload } = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { authMiddleware } = require('../middleware/auth');

// --- DATABASE MODELS FOR PERSISTENCE ---
const Tender = require('../models/Tender'); // Ensure these paths match your folder structure
const TaxRecord = require('../models/TaxRecord'); 

/**
 * Image Upload - Organizes by District and ID
 * Used by Media/Billboard Photography
 */
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    const { customId, district } = req.body; 
    
    if (!customId || !district) {
      return res.status(400).json({ message: 'SRA ID and District required for organization' });
    }

    const fileUrl = await uploadToCloudinary(req.file.path, customId, district, 'media');
    
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Document Upload - Used for Tenders and Tax Receipts
 * NOW WITH MONGODB PERSISTENCE
 */
router.post('/document', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No document provided' });

    // metadata: customId (Tender# or TaxID), district, and type
    const { 
      customId, 
      district, 
      type, 
      tenderName, 
      area, 
      startDate, 
      endDate, 
      taxFrequency, 
      licenseFee 
    } = req.body; 
    
    if (!customId || !district) {
      return res.status(400).json({ message: 'Document ID and District required' });
    }

    // 1. Upload to Cloudinary
    const fileUrl = await uploadToCloudinary(req.file.path, customId, district, type || 'documents');
    
    // 2. PERMANENT SAVE TO MONGODB
    // If it's a tender, create a permanent Tender record
    if (type === 'tender') {
      const newTender = new Tender({
        tenderName: tenderName || 'New Tender',
        tenderNumber: customId,
        district,
        area: area || '',
        startDate,
        endDate,
        taxFrequency: taxFrequency || 'Quarterly',
        licenseFee: Number(licenseFee) || 0,
        documentUrl: fileUrl, // Persistent link stored here
        status: 'Active'
      });
      await newTender.save();
    } 
    // If it's a tax receipt, update or create the Tax Record
    else if (type === 'tax') {
      const newTax = new TaxRecord({
        tenderNumber: customId,
        district,
        amount: Number(licenseFee) || 0,
        documentUrl: fileUrl,
        status: 'Paid',
        paymentDate: new Date()
      });
      await newTax.save();
    }

    // 3. Cleanup temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json({ 
      success: true, 
      url: fileUrl, 
      message: 'File organized and saved to database' 
    });
  } catch (error) {
    console.error("Upload/Save Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Bulk Document Upload 
 */
router.post('/bulk', authMiddleware, upload.array('files', 10), async (req, res) => {
  try {
    const { district, type } = req.body;
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.path, `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`, district, type)
    );
    
    const urls = await Promise.all(uploadPromises);
    
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;