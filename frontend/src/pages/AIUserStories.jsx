import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  AddTask as AddTaskIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';
import BackButton from '../components/BackButton';
import SpeakButton from '../components/SpeakButton';
import ConfirmDialog from '../components/ConfirmDialog';
import VoiceTester from '../components/VoiceTester';

export default function AIUserStories() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ description: '' });
  const [userStories, setUserStories] = useState([]);
  const [existingStories, setExistingStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Dialog state for converting story to task
  const [convertDialog, setConvertDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (projectId) {
      loadExistingStories();
      loadUsers();
    }
  }, [projectId]);

  async function loadExistingStories() {
    try {
      const res = await api.get(`/ai/user-stories/${projectId}`);
      setExistingStories(res.data);
    } catch (err) {
      console.error('Error loading existing stories:', err);
    }
  }

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const nextErrors = { description: '' };
    if (!projectDescription.trim()) {
      nextErrors.description = 'Project description is required';
    } else if (projectDescription.trim().length < 20) {
      nextErrors.description = 'Please provide at least 20 characters for better results';
    }
    setFieldErrors(nextErrors);
    if (nextErrors.description) { setLoading(false); return; }
    
    try {
      const res = await api.post('/ai/generate-user-stories', {
        projectDescription,
        projectId: projectId || null
      });
      
      setUserStories(res.data.userStories);
      setSuccess(res.data.message);
      
      if (projectId) {
        // Reload existing stories if we saved to a project
        await loadExistingStories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate user stories');
    } finally {
      setLoading(false);
    }
  }

  function handleConvertToTask(story) {
    setSelectedStory(story);
    setConvertDialog(true);
  }

  async function confirmConvertToTask() {
    try {
      await api.post(`/ai/user-stories/${selectedStory._id}/convert-to-task`, {
        assignedTo: assignedTo || null,
        deadline: deadline || null
      });
      
      setSuccess('User story converted to task successfully!');
      setConvertDialog(false);
      setSelectedStory(null);
      setAssignedTo('');
      setDeadline('');
      
      // Reload existing stories
      await loadExistingStories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert to task');
    }
  }

  function askDeleteStory(storyId) {
    setStoryToDelete(storyId);
    setConfirmOpen(true);
  }

  async function confirmDeleteStory() {
    if (!storyToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/ai/user-stories/${storyToDelete}`);
      setSuccess('User story deleted successfully');
      setConfirmOpen(false);
      setDeleting(false);
      setStoryToDelete(null);
      await loadExistingStories();
    } catch (err) {
      setDeleting(false);
      setError(err.response?.data?.message || 'Failed to delete user story');
    }
  }

  async function handleUpdateStatus(storyId, status) {
    try {
      await api.put(`/ai/user-stories/${storyId}/status`, { status });
      await loadExistingStories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return 'warning';
      case 'converted_to_task': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AIIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            AI User Story Generator
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Powered by GROQ AI - Generate detailed user stories from your project description
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Voice settings for troubleshooting TTS */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Voice settings
          </Typography>
          <VoiceTester compact />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleGenerate}>
          <TextField
            label="Project Description"
            fullWidth
            multiline
            rows={6}
            value={projectDescription}
            onChange={e => { setProjectDescription(e.target.value); if (fieldErrors.description) setFieldErrors({ description: '' }); }}
            required
            placeholder="Example: An ecommerce website where customers can browse products, add to cart, and make payments online. Admin should manage products and view orders."
            error={!!fieldErrors.description}
            helperText={fieldErrors.description || 'Describe your project in detail. The AI will generate user stories based on this description.'}
          />
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
            sx={{ mt: 3 }}
          >
            {loading ? 'Generating...' : 'Generate User Stories'}
          </Button>
        </Box>
      </Paper>

      {/* Newly Generated Stories (not yet saved) */}
      {userStories.length > 0 && !projectId && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Generated User Stories ({userStories.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Stories below are generated but not saved. Select a project to save them.
          </Typography>
          <Grid container spacing={2}>
            {userStories.map((story, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    transformOrigin: 'center',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>{story}</Typography>
                      <SpeakButton text={story} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Existing Saved Stories */}
      {existingStories.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">
              Saved User Stories ({existingStories.length})
            </Typography>
            <IconButton onClick={loadExistingStories} color="primary">
              <RefreshIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={2}>
            {existingStories.map((storyDoc) => (
              <Grid item xs={12} key={storyDoc._id}>
                <Card
                  variant="outlined"
                  sx={{
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    transformOrigin: 'center',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>{storyDoc.story}</Typography>
                      <Chip 
                        label={storyDoc.status.replace('_', ' ')} 
                        color={getStatusColor(storyDoc.status)}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    
                    {storyDoc.role && (
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`Role: ${storyDoc.role}`} size="small" variant="outlined" sx={{ mr: 1 }} />
                        {storyDoc.taskId && (
                          <Chip label="Converted to Task" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <SpeakButton text={storyDoc.story} />
                    {storyDoc.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<AddTaskIcon />}
                          onClick={() => handleConvertToTask(storyDoc)}
                        >
                          Convert to Task
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleUpdateStatus(storyDoc._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {storyDoc.status === 'rejected' && (
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleUpdateStatus(storyDoc._id, 'pending')}
                      >
                        Restore
                      </Button>
                    )}
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => askDeleteStory(storyDoc._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Convert to Task Dialog */}
      <Dialog open={convertDialog} onClose={() => setConvertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Convert User Story to Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedStory?.story}
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign To (Optional)</InputLabel>
            <Select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              label="Assign To (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Deadline (Optional)"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialog(false)}>Cancel</Button>
          <Button onClick={confirmConvertToTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Story Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => { if (!deleting) { setConfirmOpen(false); setStoryToDelete(null); } }}
        onConfirm={confirmDeleteStory}
        loading={deleting}
        title="Delete User Story"
        contentText="Are you sure you want to delete this user story?"
        confirmText="Delete"
        confirmColor="error"
      />
    </Container>
  );
}
