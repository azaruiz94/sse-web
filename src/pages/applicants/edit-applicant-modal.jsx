import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { updateApplicant } from '../../store/slices/applicantsSlice';

const EditApplicantModal = ({ open, onClose, applicant }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    id: '',
    names: '',
    mail: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (applicant) {
      setFormData(applicant);
    }
  }, [applicant]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(updateApplicant(formData)).unwrap();
      enqueueSnackbar('Applicant updated successfully', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err || 'Failed to update applicant', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Applicant</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Name"
            name="names"
            value={formData.names}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditApplicantModal;
