const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// 1. CREATE Media (Protected) - FIXES THE 404 ERROR
router.post('/', authMiddleware, async (req, res) => {
  try {
    const media = new Media(req.body);
    await media.save();
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    console.error('Create media error:', error);
    
    // Check for Duplicate SRA ID (Custom ID)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: `The ID "${req.body.id}" is already in use. Please use a unique SRA ID.` 
      });
    }

    res.status(500).json({ success: false, message: 'Failed to create media' });
  }
});

// 2. GET all media (Admin list)
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
        { id: { $regex: search, $options: 'i' } },
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

// 3. GET Public media list
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

// 4. GET Single media (handles both MongoDB _id and Custom ID)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    
    let media;
    if (isObjectId) {
      media = await Media.findById(id);
    }
    
    if (!media) {
      media = await Media.findOne({ id: id, deleted: false });
    }

    if (!media || media.deleted) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    res.json({ success: true, data: media }); 
  } catch (error) {
    console.error('Fetch single media error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// 5. UPDATE Media (Protected - handles both MongoDB _id and Custom ID)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    
    const query = isObjectId 
      ? { $or: [{ _id: id }, { id: id }] } 
      : { id: id };

    const media = await Media.findOneAndUpdate(query, req.body, { new: true });

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    res.json({ success: true, data: media }); 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. DELETE media (Soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    
    const deleteData = { deleted: true, deletedAt: new Date() };
    const query = isObjectId ? { _id: id } : { id: id };

    const media = await Media.findOneAndUpdate(query, deleteData, { new: true });

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