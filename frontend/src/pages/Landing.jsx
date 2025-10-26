import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Card, CardContent, Stack } from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { isAuthenticated, getCurrentUser } from '../services/auth';

export default function Landing() {
  const auth = isAuthenticated();
  const user = getCurrentUser();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero with animated background */}
      <Box
        className="landing-hero"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Plan, Track, Deliver — Faster
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            A modern project management tool with team collaboration, real-time progress, and AI-powered user stories.
          </Typography>

          {!auth ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Button size="large" variant="contained" onClick={() => navigate('/login')}>
                Get Started
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/register')}>
                Create Account
              </Button>
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Button size="large" variant="contained" onClick={() => navigate('/projects')}>
                Go to Projects
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/ai-stories')}>
                Try AI Stories
              </Button>
            </Stack>
          )}

          {/* Floating decorative circles */}
          <Box className="bubble bubble-1" />
          <Box className="bubble bubble-2" />
          <Box className="bubble bubble-3" />
          <Box className="bubble bubble-4" />
        </Container>
      </Box>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className="feature-card" variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DashboardCustomizeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Projects & Teams</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Organize projects, assign members, and define roles. Keep everyone aligned with clear ownership.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="feature-card" variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TaskAltIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Tasks & Progress</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create tasks, assign owners, set deadlines, and track status with a clean, modern UI.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="feature-card" variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AutoAwesomeIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">AI User Stories</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Generate high-quality user stories from a project brief and convert them to actionable tasks.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
