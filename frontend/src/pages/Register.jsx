import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Alert, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { register, login } from '../services/auth';
import BackButton from '../components/BackButton';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', role: '' });
  const navigate = useNavigate();

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const canSubmit = () => {
    return name.trim().length >= 2 && validateEmail(email) && password.length >= 6 && !!role;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = { name: '', email: '', password: '', role: '' };
    if (!name.trim()) nextErrors.name = 'Name is required';
    else if (name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!validateEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (!role) nextErrors.role = 'Role is required';
    setFieldErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.role) return;

    try {
      await register(name, email, password, role);
      // Auto-login after successful registration
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <BackButton />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={e => { setName(e.target.value); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' }); }}
            required
            error={!!fieldErrors.name}
            helperText={fieldErrors.name || ''}
          />
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
          <FormControl fullWidth margin="normal" error={!!fieldErrors.role}>
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={e => setRole(e.target.value)} label="Role">
              <MenuItem value="Developer">Developer</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
            {fieldErrors.role && <Typography variant="caption" color="error">{fieldErrors.role}</Typography>}
          </FormControl>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={!canSubmit()}>
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
