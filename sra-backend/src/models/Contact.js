/**
 * Contact Schema - Lead/Inquiry Management
 */

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  inquiryId: { type: String, unique: true },
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
  attended: { type: Boolean, default: false }, // New field to track attended status
  attendedAt: Date,
  notes: String,
}, { timestamps: true });

// Auto-generate inquiryId before saving
ContactSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Contact').countDocuments();
    this.inquiryId = `INQ-${1000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
