/**
 * SRA Backend Server
 * Node.js/Express backend for Shree Radhe Advertisers
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// --- Dynamic Environment Loading ---
// Loads .env.local if NODE_ENV is set to 'development' (local testing), 
// otherwise defaults to the standard .env (production).
const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const { connectDB } = require('./src/config/database');
const { errorHandler } = require('./src/middleware/errorHandler');

// Import routes object correctly from the index file
const routes = require('./src/routes'); 

const app = express();
// Uses the PORT from your selected .env file (e.g., 5001 locally)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Dynamically pull from .env or fallback to localhost for dev
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Explicitly allow both local and production origins to prevent CORS errors
const allowedOrigins = [
  frontendUrl,
  'http://localhost:8080',
  'https://shreeradheadvertisers.com',
  'https://www.shreeradheadvertisers.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', routes.authRoutes);
app.use('/api/analytics', routes.analyticsRoutes);
app.use('/api/media', routes.mediaRoutes);
app.use('/api/customers', routes.customerRoutes);
app.use('/api/bookings', routes.bookingRoutes);
app.use('/api/payments', routes.paymentRoutes);
app.use('/api/maintenance', routes.maintenanceRoutes);
app.use('/api/contact', routes.contactRoutes);
app.use('/api/compliance', routes.complianceRoutes);
app.use('/api/media/upload', routes.uploadRoutes);
app.use('/api/recycle-bin', routes.recycleBinRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Loaded Config: ${envFile}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

app.get('/', (req, res) => res.send('SRA Backend API is running. Use /api/health for status.'));

startServer();