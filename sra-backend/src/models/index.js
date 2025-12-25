/**
 * MongoDB Models Index
 * Export all models from a single location
 */

const Media = require('./Media');
const Customer = require('./Customer');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Maintenance = require('./Maintenance');
const Contact = require('./Contact');
const Tender = require('./Tender');
const TaxRecord = require('./TaxRecord');
const AdminUser = require('./AdminUser');

module.exports = {
  Media,
  Customer,
  Booking,
  Payment,
  Maintenance,
  Contact,
  Tender,
  TaxRecord,
  AdminUser
};
