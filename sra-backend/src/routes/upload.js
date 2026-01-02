const express = require('express');
const router = express.Router();
const fs = require('fs');
const { upload } = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { authMiddleware } = require('../middleware/auth');

/**
 * Image Upload - Organizes by District and ID
 * Used by Media/Billboard Photography
 */
router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    // Metadata sent from frontend AddMedia form
    const { customId, district } = req.body; 
    
    if (!customId || !district) {
      return res.status(400).json({ message: 'SRA ID and District required for organization' });
    }

    const fileUrl = await uploadToCloudinary(req.file.path, customId, district, 'media');
    
    // Cleanup Render temp storage immediately
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Document Upload - Used for Tenders and Tax Receipts
 * Organizes PDFs into ShreeRadhe/Districts/Name/Documents
 */
router.post('/document', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No document provided' });

    // metadata: customId (Tender# or TaxID), district, and type
    const { customId, district, type } = req.body; 
    
    if (!customId || !district) {
      return res.status(400).json({ message: 'Document ID and District required' });
    }

    // Uploads to /Documents subfolder instead of /Images
    const fileUrl = await uploadToCloudinary(req.file.path, customId, district, type || 'documents');
    
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.json({ success: true, url: fileUrl });
  } catch (error) {
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