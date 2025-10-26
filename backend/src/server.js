require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 4000;

// Required env vars check - fail fast with helpful message
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}.`);
  console.error('Create a .env file in the backend folder (you can copy .env.example) and set these values.');
  process.exit(1);
}

app.use(cors());

// Attach a simple request id for tracing
app.use((req, res, next) => {
  // Prefer crypto.randomUUID if available
  try {
    req.id = (require('crypto').randomUUID && require('crypto').randomUUID()) || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  } catch (_) {
    req.id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
  next();
});

// JSON body parsing with reasonable limit
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ message: 'Project Management API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

async function start() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/project_management_db';
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined });
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

// Guard against unhandled promise rejections and exceptions
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
