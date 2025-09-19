import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTemplate } from 'store/slices/templatesSlice';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function CreateTemplatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(state => state.templates.loading);

  const [form, setForm] = useState({
    name: '',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCKChange = (event, editor) => {
    setForm(prev => ({
      ...prev,
      content: editor.getData()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTemplate(form)).unwrap();
      enqueueSnackbar('Plantilla creada exitosamente', { variant: 'success' });
      navigate('/templates');
    } catch (err) {
      enqueueSnackbar(err?.message || 'Error al crear la plantilla', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>
          Nueva Plantilla de Resolución
        </Typography>
        <Stack spacing={3}>
          <TextField
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <div>
            <Typography variant="subtitle1" gutterBottom>
              Contenido
            </Typography>
            <CKEditor
              editor={ClassicEditor}
              data={form.content}
              onChange={handleCKChange}
            />
          </div>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/templates')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Plantilla'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}