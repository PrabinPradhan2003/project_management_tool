import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { login } from '../services/auth';
import BackButton from '../components/BackButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const canSubmit = () => {
    const e = email.trim();
    const p = password;
    return validateEmail(e) && p.length >= 6;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = { email: '', password: '' };
    if (!validateEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';
    if (password && password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    try {
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <BackButton />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
            required
            error={!!fieldErrors.email}
            helperText={fieldErrors.email || ''}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
            required
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || ''}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={!canSubmit()}>
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
