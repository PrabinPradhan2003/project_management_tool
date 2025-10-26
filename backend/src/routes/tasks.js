const express = require('express');
const router = express.Router();
const { Task, Project, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Create task (Manager or Admin)
router.post('/', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId, deadline } = req.body;
    const task = await Task.create({ title, description, project: projectId, assignee: assigneeId, deadline });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Update task (assignee can update status)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    // Allow if admin/manager or the assignee
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && String(task.assignee) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Delete task (admin/manager)
router.delete('/:id', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    await task.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// List tasks for a user or project
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { projectId, assigneeId, status } = req.query;
    const where = {};
    if (projectId) where.project = projectId;
    if (assigneeId) where.assignee = assigneeId;
    if (status) where.status = status;
    const tasks = await Task.find(where).populate('assignee').populate('project').lean();
    res.json(tasks.map(t => ({ id: t._id, title: t.title, description: t.description, status: t.status, deadline: t.deadline, projectId: t.project?._id, assignee: t.assignee?._id })));
  } catch (err) {
    next(err);
  }
});

// Reporting endpoints
router.get('/reports/summary', authenticate, async (req, res, next) => {
  try {
    const all = await Task.find().lean();
    const byStatus = all.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
    const overdue = all.filter(t => t.deadline && new Date(t.deadline) < new Date()).length;
    res.json({ byStatus, overdue });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
