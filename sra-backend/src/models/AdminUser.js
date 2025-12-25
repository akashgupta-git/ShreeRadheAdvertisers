/**
 * Admin User Schema - Authentication
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const AdminUserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'superadmin', 'viewer'], 
    default: 'admin' 
  },
  lastLogin: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Password Hashing Methods
AdminUserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(
    password, 
    this.salt, 
    10000, 
    64, 
    'sha512'
  ).toString('hex');
};

AdminUserSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(
    password, 
    this.salt, 
    10000, 
    64, 
    'sha512'
  ).toString('hex');
  return this.passwordHash === hash;
};

// Indexes
AdminUserSchema.index({ username: 1 });
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ active: 1 });

module.exports = mongoose.model('AdminUser', AdminUserSchema);
