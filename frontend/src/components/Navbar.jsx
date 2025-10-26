import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Divider, Tooltip, ListItemIcon } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import Logo from './Logo';
import { getCurrentUser, isAuthenticated, logout } from '../services/auth';

export default function Navbar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
