import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const ShowApplicantModal = ({ open, onClose, applicant }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Applicant Details</DialogTitle>
      <DialogContent dividers>
        {applicant ? (
          <Box>
            <Typography><strong>Name:</strong> {applicant.names}</Typography>
            <Typography><strong>Email:</strong> {applicant.mail}</Typography>
            <Typography><strong>Address:</strong> {applicant.address}</Typography>
            <Typography><strong>Phone:</strong> {applicant.phone}</Typography>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowApplicantModal;
