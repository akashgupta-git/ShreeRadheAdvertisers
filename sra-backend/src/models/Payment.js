/**
 * Payment Schema
 */

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  amount: { type: Number, required: true },
  mode: { 
    type: String, 
    enum: ['Cash', 'Cheque', 'Online', 'Bank Transfer'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Completed', 'Pending', 'Failed'], 
    default: 'Completed' 
  },
  transactionId: String,
  receiptUrl: String,
  notes: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
