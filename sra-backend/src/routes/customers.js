/**
 * Customer Routes
 */

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { authMiddleware } = require('../middleware/auth');

// Get all customers (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { group, search, page = 1, limit = 50 } = req.query;
    
    const filter = { deleted: false };
    if (group) filter.group = group;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Customer.countDocuments(filter)
    ]);

    res.json({ data: customers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// Get single customer (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer || customer.deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
});

// Create customer (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// Update customer (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// Delete customer - soft delete (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      { deleted: true, deletedAt: new Date() }, 
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

module.exports = router;