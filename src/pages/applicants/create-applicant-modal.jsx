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
    document: '',
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
      setFormData({ names: '', document: '', mail: '', address: '', phone: '' }); // reset
    } catch (err) {
      enqueueSnackbar(err || 'Failed to create applicant', { variant: 'error' });
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Solicitante</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Nombre completo"
            name="names"
            value={formData.names}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Nro. Documento"
            name="document"
            value={formData.document}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Correo"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateApplicantModal;
