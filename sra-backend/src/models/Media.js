/**
 * Media Schema - Outdoor Advertising Media Locations
 */

const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Unipole', 'Hoarding', 'Gantry', 'Kiosk', 'Digital LED'], 
    required: true 
  },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  address: String,
  status: { 
    type: String, 
    enum: ['Available', 'Booked', 'Coming Soon', 'Maintenance'], 
    default: 'Available' 
  },
  size: String,
  lighting: { 
    type: String, 
    enum: ['Front Lit', 'Back Lit', 'Non-Lit', 'Digital'] 
  },
  facing: String,
  image: String,
  images: [String],
  pricePerMonth: { type: Number, required: true },
  latitude: Number,
  longitude: Number,
  landmark: String,
  occupancyRate: { type: Number, default: 0 },
  totalDaysBooked: { type: Number, default: 0 },
  bookedDates: [{ 
    start: Date, 
    end: Date, 
    bookingId: mongoose.Schema.Types.ObjectId 
  }],
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// Index for search and filtering
MediaSchema.index({ state: 1, district: 1, city: 1 });
MediaSchema.index({ status: 1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ deleted: 1 });

module.exports = mongoose.model('Media', MediaSchema);
