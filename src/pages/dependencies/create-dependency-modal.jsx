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
import { createDependency } from '../../store/slices/dependenciesSlice';

const CreateDependencyModal = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: ''
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
      await dispatch(createDependency(formData)).unwrap();
      enqueueSnackbar('Dependencia creada con éxito', { variant: 'success' });
      onClose();
      setFormData({ name: '' }); // reset
    } catch (err) {
      enqueueSnackbar(err || 'Error al crear la dependencia', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Nueva Dependencia</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
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

export default CreateDependencyModal;