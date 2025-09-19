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
    document: '',
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
      <DialogTitle>Editar Solicitante</DialogTitle>
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
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditApplicantModal;
