/**
 * Upload Routes - FTP to Hostinger
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { upload } = require('../middleware/upload');
const { uploadToFTP } = require('../config/ftp');
const { authMiddleware } = require('../middleware/auth');

// Upload file to FTP (protected)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const localPath = req.file.path;
    const remotePath = `/uploads/${req.body.folder || 'media'}/${req.file.filename}`;
    
    const fileUrl = await uploadToFTP(localPath, remotePath);
    
    // Clean up temp file
    fs.unlinkSync(localPath);
    
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// Upload image to FTP (protected)
router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const localPath = req.file.path;
    const remotePath = `/uploads/images/${req.file.filename}`;
    
    const fileUrl = await uploadToFTP(localPath, remotePath);
    
    // Clean up temp file
    fs.unlinkSync(localPath);
    
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;