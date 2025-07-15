import { useState } from 'react';
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
import { createApplicant } from '../../store/slices/applicantsSlice';

  const CreateApplicantModal = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    names: '',
    mail: '',
    address: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      await dispatch(createApplicant(formData)).unwrap();
      enqueueSnackbar('Applicant created successfully', { variant: 'success' });
      onClose();
      setFormData({ names: '', mail: '', address: '', phone: '' }); // reset
    } catch (err) {
      enqueueSnackbar(err || 'Failed to create applicant', { variant: 'error' });
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Applicant</DialogTitle>
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
        <Button variant="contained" onClick={handleSubmit}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateApplicantModal;
