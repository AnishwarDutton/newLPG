import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
