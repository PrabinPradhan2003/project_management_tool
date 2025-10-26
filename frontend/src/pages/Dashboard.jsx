import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, CircularProgress } from '@mui/material';
import api from '../services/api';
import BackButton from '../components/BackButton';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const res = await api.get('/tasks/reports/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <BackButton />
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {summary ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tasks by Status
                </Typography>
                {Object.entries(summary.byStatus || {}).map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body1">{k}:</Typography>
                    <Typography variant="body1" fontWeight="bold">{v}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overdue Tasks
                </Typography>
                <Typography variant="h3" color="error">
                  {summary.overdue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
