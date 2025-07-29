import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplateById, editTemplate } from 'store/slices/templatesSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function EditTemplatePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: template, loading } = useSelector(state => state.templates);

  const [form, setForm] = useState({
    id: '',
    name: '',
    content: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchTemplateById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (template) {
      setForm({
        id: template.id,
        name: template.name || '',
        content: template.content || ''
      });
    }
  }, [template]);

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
      await dispatch(editTemplate(form)).unwrap();
      enqueueSnackbar('Plantilla actualizada exitosamente', { variant: 'success' });
      navigate(`/templates/${form.id}`);
    } catch (err) {
      enqueueSnackbar(err?.message || 'Error al actualizar la plantilla', { variant: 'error' });
    }
  };

  if (loading && !template) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={1200} mx="auto" mt={4} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Editar Plantilla de Resolución
        </Typography>
        <form onSubmit={handleSubmit}>
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
                onClick={() => navigate(`/templates/${form.id}`)}
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
                {loading ? 'Guardando...' : 'Actualizar Plantilla'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
    );
}