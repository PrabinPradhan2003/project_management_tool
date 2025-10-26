const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// All AI routes require authentication
router.use(authenticate);

// Generate user stories from project description
router.post('/generate-user-stories', aiController.generateUserStories);

// Get all user stories for a project
router.get('/user-stories/:projectId', aiController.getUserStories);

// Convert user story to task
router.post('/user-stories/:storyId/convert-to-task', aiController.convertStoryToTask);

// Update user story status
router.put('/user-stories/:storyId/status', aiController.updateUserStoryStatus);

// Delete user story
router.delete('/user-stories/:storyId', aiController.deleteUserStory);

module.exports = router;
