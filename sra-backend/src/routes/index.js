/**
 * Routes Index - Export all routes
 */

const authRoutes = require('./auth');
const analyticsRoutes = require('./analytics');
const mediaRoutes = require('./media');
const customerRoutes = require('./customers');
const bookingRoutes = require('./bookings');
const paymentRoutes = require('./payments');
const maintenanceRoutes = require('./maintenance');
const contactRoutes = require('./contact');
const complianceRoutes = require('./compliance');
const uploadRoutes = require('./upload');
const recycleBinRoutes = require('./recycleBin');

module.exports = {
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
};
