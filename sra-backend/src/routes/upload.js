/**
 * Upload Routes - FTP Bridge to Hostinger 100GB SSD
 */

const express = require('express');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { upload } = require('../middleware/upload');
const { uploadToHostinger } = require('../services/ftpService');
const { authMiddleware } = require('../middleware/auth');

/**
 * General File Upload
 * Bridges any file from Render temp storage to Hostinger public_html/uploads
 */
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const localPath = req.file.path;
    const folder = req.body.folder || 'documents'; // Default to documents if not provided
    
    const fileName = `${folder}-${Date.now()}${path.extname(req.file.originalname)}`;
    
    // UPDATED: Now passing 'folder' to the service
    const fileUrl = await uploadToHostinger(localPath, fileName, folder);
    
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    
    res.json({ 
      success: true, 
      url: fileUrl, 
      filename: fileName,
      message: 'File successfully bridged to Hostinger permanent storage' 
    });
  } catch (error) {
    console.error('Upload bridge error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'File deployment failed during FTP transfer' 
    });
  }
});

/**
 * Specialized Image Upload
 * Optimized specifically for Media/Billboard photography
 */
router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const localPath = req.file.path;
    const fileName = `media-${Date.now()}${path.extname(req.file.originalname)}`;
    
    // UPDATED: Explicitly using 'media' as the folder
    const fileUrl = await uploadToHostinger(localPath, fileName, 'media');
    
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    
    res.json({ 
      success: true, 
      url: fileUrl, 
      filename: fileName,
      message: 'Billboard photography successfully deployed to permanent storage'
    });
  } catch (error) {
    console.error('Image deployment bridge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Image deployment failed' 
    });
  }
});

module.exports = router;