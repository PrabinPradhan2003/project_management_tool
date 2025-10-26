import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, Chip, List, ListItem, ListItemText, IconButton, Alert } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import BackButton from '../components/BackButton';

export default function ProjectForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Planned');
  const [managerId, setManagerId] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', dates: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Could not fetch users for assignment', err?.response?.data || err.message);
    }
  }

  function addTaskDraft() {
    if (!newTaskTitle) {
      setError('Task title required');
      return;
    }
    setTasks(t => [...t, { title: newTaskTitle, description: newTaskDesc, assigneeId: newTaskAssignee || null, deadline: newTaskDeadline || null }]);
    setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskAssignee(''); setNewTaskDeadline('');
    setError('');
  }

  function removeTaskDraft(index) {
    setTasks(t => t.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const nextErrors = { name: '', dates: '' };
      if (!name.trim()) nextErrors.name = 'Project name is required';
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        nextErrors.dates = 'End date must be equal or after Start date';
      }
      setFieldErrors(nextErrors);
      if (nextErrors.name || nextErrors.dates) return;
      const payload = { name, description, startDate: startDate || null, endDate: endDate || null, status, managerId: managerId || null, memberIds };
      const res = await api.post('/projects', payload);
      const created = res.data;
      if (tasks.length) {
        await Promise.all(tasks.map(t => api.post('/tasks', {
          title: t.title,
          description: t.description,
          projectId: created._id || created.id,
          assigneeId: t.assigneeId,
          deadline: t.deadline,
        })));
      }
      const projectId = created._id || created.id;
      if (projectId) navigate(`/projects/${projectId}`);
      else navigate('/projects');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Failed to create project';
      setError(`Failed to create project: ${msg}`);
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <BackButton />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create Project</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={e => { setName(e.target.value); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' }); }} required error={!!fieldErrors.name} helperText={fieldErrors.name || ''} />
          <TextField label="Description" fullWidth margin="normal" multiline rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={startDate} onChange={e => { setStartDate(e.target.value); if (fieldErrors.dates) setFieldErrors({ ...fieldErrors, dates: '' }); }} />
            <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={endDate} onChange={e => { setEndDate(e.target.value); if (fieldErrors.dates) setFieldErrors({ ...fieldErrors, dates: '' }); }} error={!!fieldErrors.dates} helperText={fieldErrors.dates || ''} />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={e => setStatus(e.target.value)} label="Status">
              <MenuItem value="Planned">Planned</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Project Manager</InputLabel>
            <Select value={managerId} onChange={e => setManagerId(e.target.value)} label="Project Manager">
              <MenuItem value="">-- none --</MenuItem>
              {users.filter(u => u.role === 'Manager').map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Team Members (Developers)</InputLabel>
            <Select
              multiple
              value={memberIds}
              onChange={e => setMemberIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Team Members (Developers)"
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(id => {
                    const u = users.find(x => x.id === id);
                    return <Chip key={id} label={u ? u.name : id} size="small" />;
                  })}
                </Box>
              )}
            >
              {users.filter(u => u.role === 'Developer').map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>)}
            </Select>
          </FormControl>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Initial Tasks (optional)</Typography>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
            <TextField label="Title" fullWidth margin="dense" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            <TextField label="Description" fullWidth margin="dense" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Assignee</InputLabel>
              <Select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} label="Assignee">
                <MenuItem value="">-- none --</MenuItem>
                {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Deadline" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} />
            <Button variant="outlined" onClick={addTaskDraft} sx={{ mt: 1 }}>Add Task</Button>
          </Box>

          {tasks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Tasks to create:</Typography>
              <List dense>
                {tasks.map((t, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <IconButton edge="end" onClick={() => removeTaskDraft(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={t.title}
                      secondary={`${t.description} — Assignee: ${users.find(u => u.id === t.assigneeId)?.name || '—'} — Deadline: ${t.deadline || 'n/a'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Create Project</Button>
        </Box>
      </Paper>
    </Container>
  );
}
