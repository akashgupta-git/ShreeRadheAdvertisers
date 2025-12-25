/**
 * SRA Backend Server
 * Node.js/Express backend for Shree Radhe Advertisers
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./src/config/database');
const { errorHandler } = require('./src/middleware/errorHandler');
const {
  authRoutes,
  analyticsRoutes,
  mediaRoutes,
  customerRoutes,
  bookingRoutes,
  paymentRoutes,
  maintenanceRoutes,
  contactRoutes,
  complianceRoutes,
  uploadRoutes,
  recycleBinRoutes
} = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
