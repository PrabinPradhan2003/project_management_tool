const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['To Do','In Progress','Done'], default: 'To Do' },
  deadline: { type: Date },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // alias for compatibility
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // alias for compatibility
}, { timestamps: true });

// Virtual to ensure both fields work
taskSchema.virtual('effectiveProject').get(function() {
  return this.projectId || this.project;
});

taskSchema.virtual('effectiveAssignee').get(function() {
  return this.assignedTo || this.assignee;
});

module.exports = mongoose.model('Task', taskSchema);
