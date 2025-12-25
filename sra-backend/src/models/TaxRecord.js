/**
 * Tax Record Schema - Tax Payment Tracking
 */

const mongoose = require('mongoose');

const TaxRecordSchema = new mongoose.Schema({
  tenderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tender', 
    required: true 
  },
  tenderNumber: String,
  district: String,
  area: String,
  dueDate: { type: Date, required: true },
  paymentDate: Date,
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Overdue'], 
    default: 'Pending' 
  },
  receiptUrl: String,
  deleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// Indexes
TaxRecordSchema.index({ tenderId: 1 });
TaxRecordSchema.index({ status: 1 });
TaxRecordSchema.index({ dueDate: 1 });
TaxRecordSchema.index({ deleted: 1 });

module.exports = mongoose.model('TaxRecord', TaxRecordSchema);
