const express = require('express');
const router = express.Router();
const { Project, User, Task } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Create project (Admin or Manager). Admin has full control; Manager can create projects too.
router.post('/', authenticate, authorize(['Admin','Manager']), async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, managerId, memberAssignments, memberIds } = req.body;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be equal or after start date' });
    }
    const project = new Project({ name, description, startDate, endDate, status });
    if (managerId) project.manager = managerId;
    // support legacy memberIds array (just ids) or new memberAssignments [{ userId, role }]
    if (Array.isArray(memberAssignments)) {
      project.members = memberAssignments.map(m => ({ user: m.userId, role: m.role || 'Developer' }));
    } else if (Array.isArray(memberIds)) {
      project.members = memberIds.map(id => ({ user: id, role: 'Developer' }));
    }
    await project.save();
    const p = await Project.findById(project._id).populate('manager').populate('members.user').lean();
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create project', error: err.message });
  }
});

// Edit project
router.put('/:id', authenticate, authorize(['Admin','Manager']), async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, managerId, memberAssignments, memberIds } = req.body;
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be equal or after start date' });
    }
    if (name) p.name = name;
    if (description) p.description = description;
    if (status) p.status = status;
    if (managerId) p.manager = managerId;
    // update members: replace if provided
    if (Array.isArray(memberAssignments)) {
      p.members = memberAssignments.map(m => ({ user: m.userId, role: m.role || 'Developer' }));
    } else if (Array.isArray(memberIds)) {
      p.members = memberIds.map(id => ({ user: id, role: 'Developer' }));
    }
    await p.save();
    const updated = await Project.findById(p._id).populate('manager').populate('members.user').lean();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update', error: err.message });
  }
});

// Delete project
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    // remove associated tasks
    await Task.deleteMany({ project: p._id });
    await p.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
});

// Assign members or manager specifically
// Assign members or manager specifically (supports memberAssignments [{ userId, role }])
router.post('/:id/assign-members', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { memberAssignments, memberIds, managerId } = req.body;
    if (Array.isArray(memberAssignments)) {
      project.members = memberAssignments.map(m => ({ user: m.userId, role: m.role || 'Developer' }));
    } else if (Array.isArray(memberIds)) {
      project.members = memberIds.map(id => ({ user: id, role: 'Developer' }));
    }
    if (managerId) {
      const mgr = await User.findById(managerId);
      if (!mgr) return res.status(404).json({ message: 'Manager not found' });
      project.manager = managerId;
    }
    await project.save();
    const p = await Project.findById(project._id).populate('manager').populate('members.user').lean();
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// Members endpoints
// GET members
router.get('/:id/members', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user').lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const members = (project.members || []).map(m => ({ userId: m.user?._id || m.user, name: m.user?.name, email: m.user?.email, role_in_project: m.role }));
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// POST add members (body: { members: [{ userId, role }] })
router.post('/:id/members', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { members } = req.body; // array
    if (!Array.isArray(members)) return res.status(400).json({ message: 'members must be an array' });
    for (const m of members) {
      const uid = m.userId;
      const role = m.role || 'Developer';
      const user = await User.findById(uid);
      if (!user) continue;
      // avoid duplicates
      if (project.members.some(x => String(x.user) === String(uid))) continue;
      project.members.push({ user: uid, role });
    }
    await project.save();
    const p = await Project.findById(project._id).populate('members.user').lean();
    const membersOut = (p.members || []).map(m => ({ userId: m.user?._id, name: m.user?.name, email: m.user?.email, role_in_project: m.role }));
    res.json(membersOut);
  } catch (err) {
    next(err);
  }
});

// DELETE remove member
router.delete('/:id/members/:userId', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.members = project.members.filter(m => String(m.user) !== String(userId));
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

// PUT update role for a member
router.put('/:id/members/:userId', authenticate, authorize(['Admin','Manager']), async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role required' });
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const mem = project.members.find(m => String(m.user) === String(userId));
    if (!mem) return res.status(404).json({ message: 'Member not found on project' });
    mem.role = role;
    await project.save();
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

// List projects with basic metrics
// List projects with basic metrics and optional filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, managerId, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (managerId) where.manager = managerId;
    const skip = (Math.max(1, page) - 1) * limit;
  const projects = await Project.find(where).populate('manager').populate('members.user').skip(skip).limit(Number(limit)).lean();
    const result = await Promise.all(projects.map(async p => {
      const taskCount = await Task.countDocuments({ project: p._id });
      const doneCount = await Task.countDocuments({ project: p._id, status: 'Done' });
      const overdue = await Task.countDocuments({ project: p._id, deadline: { $exists: true, $lt: new Date() }, status: { $ne: 'Done' } });
      const progress = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
      return {
        id: p._id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        manager: p.manager ? { id: p.manager._id, name: p.manager.name, email: p.manager.email } : null,
        memberCount: p.members ? p.members.length : 0,
        taskCount,
        doneCount,
        overdue,
        progress,
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list projects', error: err.message });
  }
});

// Get project detail with tasks and members
router.get('/:id', authenticate, async (req, res) => {
  try {
  const p = await Project.findById(req.params.id).populate('manager').populate('members.user').lean();
    if (!p) return res.status(404).json({ message: 'Not found' });
    const tasks = await Task.find({ project: p._id }).populate('assignee').lean();
    const members = (p.members || []).map(m => ({ userId: m.user?._id, name: m.user?.name, email: m.user?.email, role_in_project: m.role }));
    res.json({ ...p, id: p._id, tasks, members, manager: p.manager ? { id: p.manager._id, name: p.manager.name, role: p.manager.role } : null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load project', error: err.message });
  }
});

// Project summary / metrics
router.get('/:id/summary', authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;
    const totalTasks = await Task.countDocuments({ project: projectId });
    const todo = await Task.countDocuments({ project: projectId, status: 'To Do' });
    const inProgress = await Task.countDocuments({ project: projectId, status: 'In Progress' });
    const done = await Task.countDocuments({ project: projectId, status: 'Done' });
    const overdue = await Task.countDocuments({ project: projectId, deadline: { $exists: true, $lt: new Date() }, status: { $ne: 'Done' } });
    const progress = totalTasks ? `${Math.round((done / totalTasks) * 100)}%` : '0%';
    res.json({ totalTasks, todo, inProgress, done, overdue, progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute summary', error: err.message });
  }
});

module.exports = router;
