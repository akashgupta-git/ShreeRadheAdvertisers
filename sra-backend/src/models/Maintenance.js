/**
 * Maintenance Schema
 */

const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  mediaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Media', 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], 
    default: 'Pending' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  scheduledDate: Date,
  completedDate: Date,
  cost: Number,
  assignedTo: String,
  notes: String
}, { timestamps: true });

// Indexes
MaintenanceSchema.index({ mediaId: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ priority: 1 });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
