const Groq = require('groq-sdk');
const UserStory = require('../models/userStory');
const Project = require('../models/project');
const Task = require('../models/task');

// Initialize Groq client with trimmed API key
const rawGroqKey = String(process.env.GROQ_API_KEY || '');
const GROQ_API_KEY = rawGroqKey.trim();
const groq = new Groq({ apiKey: GROQ_API_KEY });

// Simple cache for available models to avoid listing every request
let _modelCache = { list: null, ts: 0 };
const MODEL_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function getModelCandidates() {
  // Explicit override comes first if provided
  const override = (process.env.GROQ_MODEL || '').trim();
  if (override) return [override];

  const now = Date.now();
  if (!_modelCache.list || now - _modelCache.ts > MODEL_CACHE_TTL_MS) {
    try {
      const res = await groq.models.list();
      const ids = (res?.data || []).map(m => m.id);
      _modelCache = { list: ids, ts: now };
    } catch (e) {
      // If listing fails, fall back to a conservative static set
      _modelCache = {
        list: [
          'llama-3.1-70b',
          'llama-3.1-8b',
          'llama3-8b-8192',
        ],
        ts: now,
      };
    }
  }

  // Prefer Llama family, larger to smaller, exclude obvious non-chat or special models
  const all = _modelCache.list || [];
  const filtered = all
    .filter(id => typeof id === 'string')
    .filter(id => !/vision|guard|whisper|embedding/i.test(id))
    .sort((a, b) => {
      const w = (s) => (/llama/i.test(s) ? 3 : /gemma/i.test(s) ? 2 : 1) * 100 + (/70b|405b/i.test(s) ? 3 : /34b|32b/i.test(s) ? 2 : /8b|7b|9b/i.test(s) ? 1 : 0);
      return w(b) - w(a);
    });

  // Ensure we still have some reasonable defaults if filtering removed everything
  const candidates = filtered.length ? filtered : ['llama-3.1-8b'];
  return candidates;
}

/**
 * Generate user stories from project description using GROQ AI
 * POST /api/ai/generate-user-stories
 */
exports.generateUserStories = async (req, res, next) => {
  try {
    // Validate key early to provide clearer guidance than upstream 401
    if (!GROQ_API_KEY || !/^gsk_[A-Za-z0-9_-]{20,}$/.test(GROQ_API_KEY)) {
      const masked = GROQ_API_KEY ? `${GROQ_API_KEY.slice(0,4)}...${GROQ_API_KEY.slice(-4)}` : 'N/A';
      console.error(`GROQ_API_KEY missing/invalid. Masked key: ${masked}, length=${GROQ_API_KEY.length}`);
      return res.status(500).json({
        message: 'Server is not configured with a valid GROQ_API_KEY. Please set a valid key in backend/.env and restart the server.'
      });
    }
    const { projectDescription, projectId } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    // Verify project exists if projectId is provided
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    // Create the prompt for GROQ
    const prompt = `You are a product manager expert. Generate detailed user stories from the following project description.

Project Description:
${projectDescription}

Generate user stories in the following format:
As a [role], I want to [action], so that [benefit].

Generate 5-10 comprehensive user stories that cover all aspects of the project. Return ONLY the user stories as a JSON array of strings, nothing else.

Example format:
["As a customer, I want to browse products, so that I can choose what to buy.", "As an admin, I want to manage products, so that the catalog is up to date."]`;

    // Call GROQ API with model candidates (handle deprecations gracefully)
    let chatCompletion;
    const modelCandidates = await getModelCandidates();
    let lastError;
    for (const model of modelCandidates) {
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model,
          temperature: 0.7,
          max_tokens: 2000,
        });
        break; // success
      } catch (err) {
        const status = err?.response?.status;
        const msg = (err?.response?.data?.error?.message || err?.message || '').toLowerCase();
        // Stop retrying for auth issues
        if (status === 401 || /invalid api key/.test(msg)) {
          lastError = err;
          break;
        }
        // Continue to next model for decommissioned/not found
        if (status === 400 && /decommissioned|no longer supported|model/.test(msg)) {
          lastError = err;
          continue;
        }
        if (status === 404) {
          lastError = err;
          continue;
        }
        // Other errors: record and break
        lastError = err;
        break;
      }
    }
    if (!chatCompletion) throw lastError || new Error('Failed to get completion from all candidate models');

    // Extract and parse the response
    let userStoriesText = chatCompletion.choices[0]?.message?.content || '[]';
    
    // Clean up the response - remove markdown code blocks if present
    userStoriesText = userStoriesText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let userStories;
    try {
      userStories = JSON.parse(userStoriesText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract user stories manually
      const storyMatches = userStoriesText.match(/As a .+?, I want to .+?, so that .+?\./g);
      userStories = storyMatches || [];
    }

    // Validate that we got user stories
    if (!Array.isArray(userStories) || userStories.length === 0) {
      return res.status(500).json({ 
        message: 'Failed to generate valid user stories',
        rawResponse: userStoriesText 
      });
    }

    // Parse and store user stories in database if projectId is provided
    let savedStories = [];
    if (projectId) {
      for (const story of userStories) {
        // Extract role, action, and benefit using regex
        const match = story.match(/As a (.+?), I want to (.+?), so that (.+?)\.?$/);
        
        const userStoryDoc = new UserStory({
          projectId,
          story,
          role: match ? match[1] : null,
          action: match ? match[2] : null,
          benefit: match ? match[3] : null,
          status: 'pending'
        });
        
        const saved = await userStoryDoc.save();
        savedStories.push(saved);
      }
    }

    res.json({
      success: true,
      userStories,
      savedStories: projectId ? savedStories : null,
      message: `Generated ${userStories.length} user stories successfully`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all user stories for a project
 * GET /api/ai/user-stories/:projectId
 */
exports.getUserStories = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const userStories = await UserStory.find({ projectId })
      .populate('taskId')
      .sort({ createdAt: -1 });

    res.json(userStories);
  } catch (error) {
    next(error);
  }
};

/**
 * Convert a user story to a task
 * POST /api/ai/user-stories/:storyId/convert-to-task
 */
exports.convertStoryToTask = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { assignedTo, deadline } = req.body;

    const userStory = await UserStory.findById(storyId);
    if (!userStory) {
      return res.status(404).json({ message: 'User story not found' });
    }

    // Create a task from the user story
    const task = new Task({
      title: userStory.action || userStory.story.substring(0, 100),
      description: userStory.story,
      projectId: userStory.projectId,
      assignedTo,
      status: 'To Do',
      deadline: deadline || null
    });

    const savedTask = await task.save();

    // Update user story status
    userStory.status = 'converted_to_task';
    userStory.taskId = savedTask._id;
    await userStory.save();

    res.json({
      success: true,
      task: savedTask,
      userStory
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user story
 * DELETE /api/ai/user-stories/:storyId
 */
exports.deleteUserStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    
    const userStory = await UserStory.findByIdAndDelete(storyId);
    if (!userStory) {
      return res.status(404).json({ message: 'User story not found' });
    }

    res.json({ success: true, message: 'User story deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user story status
 * PUT /api/ai/user-stories/:storyId/status
 */
exports.updateUserStoryStatus = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { status } = req.body;

    if (!['pending', 'converted_to_task', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const userStory = await UserStory.findByIdAndUpdate(
      storyId,
      { status },
      { new: true }
    );

    if (!userStory) {
      return res.status(404).json({ message: 'User story not found' });
    }

    res.json(userStory);
  } catch (error) {
    next(error);
  }
};
