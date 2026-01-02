const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Get all media (protected admin list)
router.get('/', authMiddleware, async (req, res) => {
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
        { id: { $regex: search, $options: 'i' } }, // Search by custom SRA ID
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
        { id: { $regex: search, $options: 'i' } }
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
    const { id } = req.params;
    
    // Check if the parameter is a valid MongoDB ObjectId format
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    
    let media;
    if (isObjectId) {
      media = await Media.findById(id);
    }
    
    // Fallback: search by your custom 'id' (e.g., SRA-RPR-001) if not found or not an ObjectId
    if (!media) {
      media = await Media.findOne({ id: id, deleted: false });
    }

    if (!media || media.deleted) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    // Crucial: Wrap in data property to satisfy adaptMediaLocation frontend service
    res.json({ success: true, data: media }); 
  } catch (error) {
    console.error('Fetch single media error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Create media (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const media = new Media(req.body);
    await media.save();
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    console.error('Create media error:', error);
    
    // Handle Duplicate Custom ID Error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: `The ID "${req.body.id}" is already in use. Please use a unique SRA ID.` 
      });
    }

    res.status(500).json({ success: false, message: 'Failed to create media' });
  }
});

// Update media (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Determine if we are updating by ObjectId or custom ID
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let media;

    if (isObjectId) {
      media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      media = await Media.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ success: false, message: 'Failed to update media' });
  }
});

// Delete media - soft delete (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let media;

    const deleteData = { deleted: true, deletedAt: new Date() };

    if (isObjectId) {
      media = await Media.findByIdAndUpdate(req.params.id, deleteData, { new: true });
    } else {
      media = await Media.findOneAndUpdate({ id: req.params.id }, deleteData, { new: true });
    }

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, message: 'Media moved to recycle bin' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete media' });
  }
});

module.exports = router;