const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Project, Task } = require('../models');
const UserStory = require('../models/userStory');
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

// Delete account - requires password confirmation
router.delete('/me', authenticate, async (req, res, next) => {
  try {
    const { password } = req.body;
    
    // Validate password is provided
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    // Get user with password field
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Remove user from all project members
    await Project.updateMany(
      { 'members.user': user._id },
      { $pull: { members: { user: user._id } } }
    );

    // Delete all tasks assigned to this user
    await Task.deleteMany({ assignee: user._id });

    // Delete all user stories associated with user's projects
    const userProjects = await Project.find({ 'members.user': user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    await UserStory.deleteMany({ projectId: { $in: projectIds } });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
