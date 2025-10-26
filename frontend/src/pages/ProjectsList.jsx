import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Box, IconButton, Link as MuiLink } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const user = getCurrentUser();
  const canCreate = user && (user.role === 'Manager' || user.role === 'Admin');

  function askDelete(id) {
    setDeletingId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deletingId}`);
      setConfirmOpen(false);
      setDeleting(false);
      setDeletingId(null);
      fetchProjects();
    } catch (err) {
      setDeleting(false);
      // Optional: show a toast/alert UI; keeping console for brevity
      console.error(err?.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        {canCreate && (
          <Button variant="contained" onClick={() => navigate('/projects/new')}>
            Create Project
          </Button>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <MuiLink onClick={() => navigate(`/projects/${p.id}`)} sx={{ cursor: 'pointer' }}>
                    {p.name}
                  </MuiLink>
                </TableCell>
                <TableCell>{p.manager ? p.manager.name : '—'}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell>{p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress variant="determinate" value={p.progress ?? 0} />
                    </Box>
                    <Typography variant="body2">{p.progress ?? 0}%</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/projects/${p.id}`)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {user?.role === 'Admin' && (
                    <>
                      <IconButton size="small" onClick={() => navigate(`/projects/${p.id}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => askDelete(p.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => { if (!deleting) { setConfirmOpen(false); setDeletingId(null); } }}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Project"
        contentText="Delete this project? This will also delete related tasks."
        confirmText="Delete"
        confirmColor="error"
      />
    </Container>
  );
}
