import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import api from '../services/api';
import dayjs from 'dayjs';
import BackButton from '../components/BackButton';

export default function TaskForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState(location.state?.projectId || '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ title: '', projectId: '', deadline: '' });

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    try {
      const res = await api.get('/tasks', { params: { } });
      const found = res.data.find(t => String(t.id) === String(id));
      if (found) {
        setTitle(found.title);
        setDescription(found.description || '');
        setStatus(found.status || 'To Do');
        setDeadline(found.deadline ? dayjs(found.deadline).format('YYYY-MM-DD') : '');
        setProjectId(found.projectId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const nextErrors = { title: '', projectId: '', deadline: '' };
      if (!title.trim()) nextErrors.title = 'Title is required';
      if (!projectId) nextErrors.projectId = 'Project ID is required';
      if (deadline) {
        const d = new Date(deadline);
        if (isNaN(d.getTime())) nextErrors.deadline = 'Deadline must be a valid date';
      }
      setFieldErrors(nextErrors);
      if (nextErrors.title || nextErrors.projectId || nextErrors.deadline) return;

      const payload = { title, description, status, deadline: deadline || null, projectId };
      if (id) {
        await api.put(`/tasks/${id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to save task');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <BackButton />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Task' : 'Create Task'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={e => { setTitle(e.target.value); if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' }); }}
            required
            error={!!fieldErrors.title}
            helperText={fieldErrors.title || ''}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <TextField
            label="Project ID"
            fullWidth
            margin="normal"
            value={projectId}
            onChange={e => { setProjectId(e.target.value); if (fieldErrors.projectId) setFieldErrors({ ...fieldErrors, projectId: '' }); }}
            required
            disabled={!!location.state?.projectId}
            error={!!fieldErrors.projectId}
            helperText={fieldErrors.projectId || ''}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={e => setStatus(e.target.value)} label="Status">
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Deadline"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={e => { setDeadline(e.target.value); if (fieldErrors.deadline) setFieldErrors({ ...fieldErrors, deadline: '' }); }}
            error={!!fieldErrors.deadline}
            helperText={fieldErrors.deadline || ''}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Save Task
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
