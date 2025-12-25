/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const { Media, Booking, Customer } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Dashboard Stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [totalMedia, availableMedia, bookedMedia, comingSoon, maintenance, totalCustomers, activeBookings] = await Promise.all([
      Media.countDocuments({ deleted: false }),
      Media.countDocuments({ deleted: false, status: 'Available' }),
      Media.countDocuments({ deleted: false, status: 'Booked' }),
      Media.countDocuments({ deleted: false, status: 'Coming Soon' }),
      Media.countDocuments({ deleted: false, status: 'Maintenance' }),
      Customer.countDocuments({ deleted: false }),
      Booking.countDocuments({ deleted: false, status: { $in: ['Active', 'Upcoming'] } })
    ]);

    const statesCount = await Media.distinct('state', { deleted: false });
    const districtsCount = await Media.distinct('district', { deleted: false });

    const revenueAgg = await Booking.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' }, pendingPayments: { $sum: { $subtract: ['$amount', '$amountPaid'] } } } }
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, pendingPayments: 0 };

    res.json({
      totalMedia,
      available: availableMedia,
      booked: bookedMedia,
      comingSoon,
      maintenance,
      statesCount: statesCount.length,
      districtsCount: districtsCount.length,
      totalCustomers,
      activeBookings,
      totalRevenue: revenue.totalRevenue,
      pendingPayments: revenue.pendingPayments
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// City Revenue Loss - Vacant Sites by City
router.get('/city-loss', authMiddleware, async (req, res) => {
  try {
    const vacantByCity = await Media.aggregate([
      { $match: { deleted: false, status: 'Available' } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          totalLoss: { $sum: '$pricePerMonth' }
        }
      },
      { $sort: { totalLoss: -1 } },
      { $limit: 10 }
    ]);

    res.json(vacantByCity.map(item => ({
      name: item._id,
      count: item.count,
      loss: item.totalLoss
    })));
  } catch (error) {
    console.error('City loss analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch city loss data' });
  }
});

// Vacant Sites for Specific City
router.get('/vacant-sites/:city', authMiddleware, async (req, res) => {
  try {
    const { city } = req.params;
    
    const vacantSites = await Media.find({
      deleted: false,
      status: 'Available',
      city: city
    }).select('name type address pricePerMonth size lighting facing createdAt');

    const sitesWithVacancy = vacantSites.map(site => {
      const daysVacant = Math.floor((Date.now() - site.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: site._id,
        name: site.name,
        type: site.type,
        address: site.address,
        pricePerMonth: site.pricePerMonth,
        size: site.size,
        lighting: site.lighting,
        facing: site.facing,
        daysVacant: Math.max(15, daysVacant)
      };
    });

    res.json({
      city,
      count: sitesWithVacancy.length,
      monthlyLoss: sitesWithVacancy.reduce((sum, s) => sum + s.pricePerMonth, 0),
      sites: sitesWithVacancy.sort((a, b) => b.daysVacant - a.daysVacant)
    });
  } catch (error) {
    console.error('Vacant sites error:', error);
    res.status(500).json({ message: 'Failed to fetch vacant sites' });
  }
});

// Monthly Revenue Trend
router.get('/revenue-trend', authMiddleware, async (req, res) => {
  try {
    const trend = await Booking.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$amountPaid' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = trend.map(item => {
      const [, month] = item._id.split('-');
      return {
        month: months[parseInt(month) - 1],
        bookings: item.bookings,
        revenue: item.revenue
      };
    });

    res.json(formattedTrend);
  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue trend' });
  }
});

// State Revenue Distribution
router.get('/state-revenue', authMiddleware, async (req, res) => {
  try {
    const stateRevenue = await Booking.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media'
        }
      },
      { $unwind: '$media' },
      {
        $group: {
          _id: '$media.state',
          revenue: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(stateRevenue.map(item => ({
      name: item._id,
      value: item.revenue,
      count: item.count
    })));
  } catch (error) {
    console.error('State revenue error:', error);
    res.status(500).json({ message: 'Failed to fetch state revenue' });
  }
});

// Occupancy Data
router.get('/occupancy', authMiddleware, async (req, res) => {
  try {
    const media = await Media.find({ deleted: false })
      .select('name occupancyRate totalDaysBooked')
      .sort({ occupancyRate: -1 })
      .limit(20);

    res.json(media.map(m => ({
      mediaId: m._id,
      mediaName: m.name,
      occupancyRate: m.occupancyRate,
      totalDaysBooked: m.totalDaysBooked
    })));
  } catch (error) {
    console.error('Occupancy error:', error);
    res.status(500).json({ message: 'Failed to fetch occupancy data' });
  }
});

module.exports = router;
