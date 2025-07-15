import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const DeleteApplicantModal = ({ open, onClose, applicant, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent dividers>
        {applicant ? (
          <Typography>
            Are you sure you want to delete applicant{' '}
            <strong>{applicant.names}</strong>?
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

export default DeleteApplicantModal;