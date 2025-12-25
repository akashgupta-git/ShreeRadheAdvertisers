/**
 * Error Handler Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'File too large. Maximum size is 100MB.' 
    });
  }

  // Multer file type error
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `Duplicate value for ${field}. Please use a unique value.` 
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // JWT errors are handled in auth middleware

  // Default error
  res.status(500).json({ message: 'Internal server error.' });
};

module.exports = { errorHandler };
