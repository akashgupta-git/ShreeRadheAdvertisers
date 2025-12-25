/**
 * Contact Schema - Lead/Inquiry Management
 */

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: String,
  mediaType: String,
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'], 
    default: 'New' 
  },
  notes: String,
  assignedTo: String
}, { timestamps: true });

// Indexes
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', ContactSchema);
