const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  story: {
    type: String,
    required: true
  },
  role: String,        // Extracted "As a [role]"
  action: String,      // Extracted "I want to [action]"
  benefit: String,     // Extracted "so that [benefit]"
  status: {
    type: String,
    enum: ['pending', 'converted_to_task', 'rejected'],
    default: 'pending'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserStory', userStorySchema);
