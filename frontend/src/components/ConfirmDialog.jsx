import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function ConfirmDialog({
  open,
  title = 'Confirm Delete',
  contentText = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof contentText === 'string' ? (
          <Typography variant="body2">{contentText}</Typography>
        ) : (
          contentText
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {loading ? 'Please wait…' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
