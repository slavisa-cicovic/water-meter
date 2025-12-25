import { useId } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const titleId = useId();
  const contentId = useId();

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={content ? contentId : undefined}
      {...other}
    >
      <DialogTitle id={titleId} sx={{ pb: 2 }}>
        {title}
      </DialogTitle>

      {content && (
        <DialogContent id={contentId} sx={{ typography: 'body2' }}>
          {content}
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ minWidth: '100px' }}>
          Cancel
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}
