/**
 * Booking Schema
 */

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  mediaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Media', 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Upcoming', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Partially Paid', 'Paid'], 
    default: 'Pending' 
  },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'Cheque', 'Online', 'Bank Transfer'] 
  },
  notes: String,
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// Indexes
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ mediaId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ deleted: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
