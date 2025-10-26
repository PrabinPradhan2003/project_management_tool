const mongoose = require('mongoose');

const User = require('./user');
const Project = require('./project');
const Task = require('./task');

module.exports = {
  mongoose,
  User,
  Project,
  Task,
};
