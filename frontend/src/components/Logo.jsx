import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * Logo component
 * Props:
 * - variant: 'kanban' | 'shield' | 'tick'
 * - compact: hide brand text
 */
export default function Logo({ variant = 'kanban', compact = false, sx }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      className="brand-logo"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        mr: 3,
        ...sx,
      }}
      title="Project Management"
    >
      {variant === 'kanban' && (
        <svg
          className="logo-kanban"
          width={40}
          height={40}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Project Management Logo"
        >
          <defs>
            <linearGradient id="lgk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1976d2" />
              <stop offset="100%" stopColor="#7b1fa2" />
            </linearGradient>
          </defs>
          {/* Columns */}
          <rect className="col col1" x="8" y="10" width="12" height="44" rx="4" fill="url(#lgk)" opacity="0.9" />
          <rect className="col col2" x="26" y="10" width="12" height="44" rx="4" fill="url(#lgk)" opacity="0.75" />
          <rect className="col col3" x="44" y="10" width="12" height="44" rx="4" fill="url(#lgk)" opacity="0.6" />
          {/* Cards */}
          <rect className="card" x="10.5" y="16" width="7" height="6" rx="2" fill="#fff" opacity="0.95" />
          <rect className="card" x="28.5" y="28" width="7" height="6" rx="2" fill="#fff" opacity="0.9" />
          <rect className="card" x="46.5" y="38" width="7" height="6" rx="2" fill="#fff" opacity="0.85" />
        </svg>
      )}

      {variant === 'shield' && (
        <svg
          className="logo-icon"
          width={40}
          height={40}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Project Management Logo"
        >
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1976d2" />
              <stop offset="100%" stopColor="#7b1fa2" />
            </linearGradient>
          </defs>
          <path d="M32 4l18 10v20l-18 10L14 34V14L32 4z" fill="url(#lg1)" opacity="0.95" />
          <path d="M26 32l5 5 11-13" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {variant === 'tick' && (
        <svg
          className="logo-tick"
          width={40}
          height={40}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Project Management Logo"
        >
          <defs>
            <linearGradient id="lgt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1976d2" />
              <stop offset="100%" stopColor="#7b1fa2" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="22" fill="url(#lgt)" opacity="0.95" />
          <path
            className="tick-path"
            d="M22 33l7 7 14-16"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
          />
        </svg>
      )}

      {!compact && (
        <span className="brand-text">ProManage</span>
      )}
    </Box>
  );
}
