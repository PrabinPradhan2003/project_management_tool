import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, 
  Divider, Tooltip, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert
} from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import DeleteForever from '@mui/icons-material/DeleteForever';
import Logo from './Logo';
import { getCurrentUser, isAuthenticated, logout } from '../services/auth';
import api from '../services/api';

export default function Navbar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [deleteError, setDeleteError] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  const open = Boolean(anchorEl);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteAccountClick = () => {
    setAnchorEl(null);
    setDeleteDialogOpen(true);
    setPassword('');
    setDeleteError('');
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!password) {
      setDeleteError('Password is required');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/users/me', { data: { password } });
      // Account deleted successfully
      logout();
      navigate('/login', { replace: true });
      // Optional: Show success message
    } catch (err) {
      setDeleting(false);
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  function initials(name = '') {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
  <Logo variant="kanban" />
        {/* Always show Home button */}
        <Button color="inherit" component={RouterLink} to="/">
          Home
        </Button>
        {isAuthenticated() && (
          <>
            <Button color="inherit" component={RouterLink} to="/projects">
              Projects
            </Button>
            <Button color="inherit" component={RouterLink} to="/ai-stories">
              AI Stories
            </Button>
          </>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {isAuthenticated() && (
          <>
            <Tooltip title="Account">
              <IconButton
                onClick={handleAvatarClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {initials(user?.name)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                <Typography variant="caption" color="text.secondary">Role: {user?.role}</Typography>
              </Box>
              <Divider />
              {/* Future: <MenuItem onClick={() => navigate('/account')}>Manage Account</MenuItem> */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
              <MenuItem onClick={handleDeleteAccountClick} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteForever fontSize="small" color="error" />
                </ListItemIcon>
                Delete Account
              </MenuItem>
            </Menu>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  Are you sure you want to delete your account? This action cannot be undone.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  All your data including:
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                  <li>Your profile information</li>
                  <li>Tasks assigned to you</li>
                  <li>Your project memberships</li>
                </Typography>
                <Typography variant="body2" color="error" paragraph sx={{ mt: 2 }}>
                  will be permanently deleted.
                </Typography>

                {deleteError && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {deleteError}
                  </Alert>
                )}

                <TextField
                  autoFocus
                  margin="dense"
                  label="Enter your password to confirm"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={deleting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && password) {
                      handleDeleteConfirm();
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel} disabled={deleting}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm} 
                  color="error" 
                  variant="contained"
                  disabled={deleting || !password}
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
