const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Planned','In Progress','Completed','On Hold'], default: 'Planned' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // members: array of { user: ObjectId, role: 'Manager'|'Developer' }
  members: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: { type: String, enum: ['Manager','Developer'], default: 'Developer' } }],
}, { timestamps: true });

// Virtual to populate tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.set('toObject', { virtuals: true });
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
