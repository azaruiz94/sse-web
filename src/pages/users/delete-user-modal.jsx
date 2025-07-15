import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const DeleteUserModal = ({ open, onClose, user, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent dividers>
        {user ? (
          <Typography>
            Are you sure you want to delete user{' '}
            <strong>{user.username}</strong>?
          </Typography>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserModal;