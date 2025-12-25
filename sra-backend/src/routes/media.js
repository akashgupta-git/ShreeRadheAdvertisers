/**
 * Media Routes
 */

const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Get all media (public with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { state, district, city, type, status, search, minPrice, maxPrice, page = 1, limit = 50 } = req.query;
    
    const filter = { deleted: false };
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (city) filter.city = city;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};
      if (minPrice) filter.pricePerMonth.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerMonth.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [media, total] = await Promise.all([
      Media.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Media.countDocuments(filter)
    ]);

    res.json({ 
      success: true,
      data: media, 
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Media list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Public media list (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { state, district, city, type, status, search, page = 1, limit = 50 } = req.query;
    
    const filter = { deleted: false };
    if (state && state !== 'all') filter.state = state;
    if (district && district !== 'all') filter.district = district;
    if (city && city !== 'all') filter.city = city;
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [media, total] = await Promise.all([
      Media.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Media.countDocuments(filter)
    ]);

    res.json({ 
      success: true,
      data: media, 
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Public media list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Get single media (public with optional auth)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media || media.deleted) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media' });
  }
});

// Create media (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const media = new Media(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (error) {
    console.error('Create media error:', error);
    res.status(500).json({ message: 'Failed to create media' });
  }
});

// Update media (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update media' });
  }
});

// Delete media - soft delete (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id, 
      { deleted: true, deletedAt: new Date() }, 
      { new: true }
    );
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json({ message: 'Media moved to recycle bin' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete media' });
  }
});

module.exports = router;
