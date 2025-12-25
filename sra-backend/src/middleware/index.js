/**
 * Middleware Index
 */

const { authMiddleware, requireRole, optionalAuth, generateToken, JWT_SECRET, JWT_EXPIRES_IN } = require('./auth');
const { upload, uploadDir } = require('./upload');
const { errorHandler } = require('./errorHandler');

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
  generateToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  upload,
  uploadDir,
  errorHandler
};
