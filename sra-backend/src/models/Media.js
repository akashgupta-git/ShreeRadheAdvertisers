/**
 * Media Schema - Outdoor Advertising Media Locations
 */
const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  // ADD THIS FIELD: This handles your custom SRA IDs (e.g., SRA-RPR-001)
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Unipole', 'Hoarding', 'Gantry', 'Kiosk', 'Digital LED'], 
    required: true 
  },
  // ... rest of your existing fields ...
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  address: String,
  status: { 
    type: String, 
    enum: ['Available', 'Booked', 'Coming Soon', 'Maintenance'], 
    default: 'Available' 
  },
  pricePerMonth: { type: Number, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// FIX: Use 'MediaSchema' (Capital M) to match your definition above
MediaSchema.set('toJSON', { virtuals: false });

// Existing indexes
MediaSchema.index({ state: 1, district: 1, city: 1 });
MediaSchema.index({ status: 1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ deleted: 1 });

module.exports = mongoose.model('Media', MediaSchema);