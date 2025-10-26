const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// List users (Admin or Manager)
// Managers should be able to assign team members when creating projects
router.get('/', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const users = await User.find({}, { name:1, email:1, role:1 }).lean();
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
  } catch (err) {
    next(err);
  }
});

// Get profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { id, name, email, role } = req.user;
    res.json({ id, name, email, role });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
