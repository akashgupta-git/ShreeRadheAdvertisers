/**
 * Customer Schema
 */

const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true },
  address: String,
  group: { 
    type: String, 
    enum: ['Corporate', 'Government', 'Agency', 'Startup', 'Non-Profit'], 
    default: 'Corporate' 
  },
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// Index for search
CustomerSchema.index({ name: 'text', company: 'text', email: 'text' });
CustomerSchema.index({ group: 1 });
CustomerSchema.index({ deleted: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
