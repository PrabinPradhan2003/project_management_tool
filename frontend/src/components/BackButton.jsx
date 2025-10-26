import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton({ to }) {
  const navigate = useNavigate();
  return (
    <Tooltip title="Go back">
      <IconButton
        onClick={() => {
          if (to) navigate(to);
          else navigate(-1);
        }}
        sx={{ mb: 1 }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
}
