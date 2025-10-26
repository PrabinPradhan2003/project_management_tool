import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import TaskForm from './pages/TaskForm';
import AIUserStories from './pages/AIUserStories';
import PrivateRoute from './components/PrivateRoute';
import { Toolbar } from '@mui/material';

function App() {
  return (
    <>
      <Navbar />
      {/* Spacer to offset fixed AppBar height */}
      <Toolbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<PrivateRoute><ProjectsList/></PrivateRoute>} />
        <Route path="/projects/new" element={<PrivateRoute><ProjectForm/></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail/></PrivateRoute>} />
        <Route path="/projects/:projectId/ai-stories" element={<PrivateRoute><AIUserStories/></PrivateRoute>} />
        <Route path="/ai-stories" element={<PrivateRoute><AIUserStories/></PrivateRoute>} />
        <Route path="/tasks/new" element={<PrivateRoute><TaskForm/></PrivateRoute>} />
        <Route path="/tasks/:id/edit" element={<PrivateRoute><TaskForm/></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
