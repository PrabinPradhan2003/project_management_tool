import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Box, LinearProgress, Chip, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('Developer');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      try {
        const ures = await api.get('/users');
        setUsers(ures.data || []);
      } catch (uerr) {
        // not critical if unauthorized
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask() {
    navigate('/tasks/new', { state: { projectId: id } });
  }

  function isOverdue(task) {
    return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done';
  }

  async function changeStatus(taskId, newStatus) {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to update status');
    }
  }

  async function addMember() {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }
    try {
      await api.post(`/projects/${id}/members`, { members: [{ userId: selectedUser, role: selectedRole }] });
      setSelectedUser('');
      setSelectedRole('Developer');
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to add member');
    }
  }

  function askRemoveMember(userId) {
    setMemberToRemove(userId);
    setConfirmOpen(true);
  }

  async function confirmRemoveMember() {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await api.delete(`/projects/${id}/members/${memberToRemove}`);
      setConfirmOpen(false);
      setRemoving(false);
      setMemberToRemove(null);
      await load();
    } catch (err) {
      console.error(err);
      setRemoving(false);
    }
  }

  async function updateMemberRole(userId, role) {
    try {
      await api.put(`/projects/${id}/members/${userId}`, { role });
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to update role');
    }
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <BackButton />
        <Typography>Loading or project not found</Typography>
      </Container>
    );
  }

  const total = project.tasks?.length || 0;
  const done = project.tasks?.filter(t => t.status === 'Done').length || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <BackButton />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>{project.name}</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {project.description}
          </Typography>
          <Chip label={project.status} color="primary" variant="outlined" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Tasks</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate(`/projects/${id}/ai-stories`)}>
                AI Stories
              </Button>
              <Button variant="contained" onClick={handleCreateTask}>Create Task</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Progress:</Typography>
            {total > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress variant="determinate" value={pct} />
                </Box>
                <Typography variant="body2">{done}/{total} done ({pct}%)</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No tasks</Typography>
            )}
          </Box>

          {(project.tasks || []).map(t => {
            const tid = t.id || t._id;
            const overdue = isOverdue(t);
            return (
              <Card key={tid} sx={{ mb: 2, bgcolor: overdue ? '#ffe6e6' : 'inherit' }} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{t.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assignee: {t.assignee?.name || 'Unassigned'} • Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'n/a'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={t.status} onChange={e => changeStatus(tid, e.target.value)}>
                          <MenuItem value="To Do">To Do</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Done">Done</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => navigate(`/tasks/${tid}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Members</Typography>
          
          {(user && (user.role === 'Admin' || user.role === 'Manager')) && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Add Member</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel>Select User</InputLabel>
                  <Select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} label="Select User">
                    <MenuItem value="">-- select user --</MenuItem>
                    {users.map(u => <MenuItem key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.email})</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} label="Role">
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={addMember}>Add</Button>
              </Box>
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(project.members || []).map(m => (
                  <TableRow key={m.userId}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>
                      {(user && (user.role === 'Admin' || user.role === 'Manager')) ? (
                        <Select size="small" value={m.role_in_project} onChange={e => updateMemberRole(m.userId, e.target.value)}>
                          <MenuItem value="Developer">Developer</MenuItem>
                          <MenuItem value="Manager">Manager</MenuItem>
                        </Select>
                      ) : m.role_in_project}
                    </TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell align="right">
                      {(user && (user.role === 'Admin' || user.role === 'Manager')) && (
                        <IconButton size="small" color="error" onClick={() => askRemoveMember(m.userId)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => { if (!removing) { setConfirmOpen(false); setMemberToRemove(null); } }}
        onConfirm={confirmRemoveMember}
        loading={removing}
        title="Remove Member"
        contentText="Remove this member from the project?"
        confirmText="Remove"
        confirmColor="error"
      />
    </Container>
  );
}
