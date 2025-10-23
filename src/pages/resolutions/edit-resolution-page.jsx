import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResolutionById, updateResolution } from 'store/slices/resolutionsSlice';
import { fetchTemplatesByPage } from 'store/slices/templatesSlice';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { EditOutlined } from '@ant-design/icons';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function EditResolutionPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current: resolution, loading, error } = useSelector((state) => state.resolutions);
  const templates = useSelector((state) => state.templates.list);
  const templatesLoading = useSelector((state) => state.templates.loading);
  // number and issuedDate are assigned by the backend upon generation

  const [form, setForm] = useState({
    recordId: '',
    content: '',
    resolvedByDean: true
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [recordSearch, setRecordSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchResolutionById(id));
      dispatch(fetchTemplatesByPage(1));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (resolution) {
      if (resolution.resolved) {
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(`/resoluciones/${id}`);
        }, 2000);
      } else {
        setForm((prev) => ({
          ...prev,
          recordId: resolution.recordId || '',
          content: resolution.content || '',
          resolvedByDean: !!resolution.resolvedByDean
        }));
      }
    }
  }, [resolution, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (event, editor) => {
    const data = editor.getData();
    setForm((prev) => ({
      ...prev,
      content: data
    }));
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === Number(templateId));
    if (template) {
      setForm((prev) => ({
        ...prev,
        content: template.content
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateResolution({ id, ...form })).then((action) => {
      if (!action.error) {
        navigate(`/resoluciones/${id}`);
      }
    });
  };

  const handleRecordSearchChange = (e) => {
    setRecordSearch(e.target.value);
    setSearchTouched(false);
  };

  const handleRecordSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchLoading(true);
      setSearchTouched(true);
      // Replace this with your actual searchRecords thunk if available
      const results = await dispatch(
        // searchRecords({ number: Number(recordSearch) }) // Uncomment if you have this thunk
      );
      // setSearchResults(results.payload || []); // Uncomment if using thunk
      setSearchLoading(false);
    }
  };

  const handleSelectRecord = (record) => {
    setRecordSearch(
      `Expediente #${record.number} - ${record.applicant?.names || ''} (Documento: ${record.applicant?.document || ''})`
    );
    setForm((prev) => ({
      ...prev,
      recordId: record.id
    }));
    setSearchTouched(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Resolución</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title="Esta resolución se está editando como borrador.">
                <Chip
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EditOutlined fontSize="small" sx={{ mr: 0.5 }} />
                      Borrador
                    </Box>
                  }
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.warning.lighter,
                    color: (theme) => theme.palette.warning.dark,
                    fontSize: 14
                  }}
                />
              </Tooltip>
            </Box>
          </Grid>
          {/* Number and Issued Date are assigned by the backend upon generation. */}
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Buscar expediente por número o número de documento del solicitante"
              value={recordSearch}
              onChange={handleRecordSearchChange}
              onKeyDown={handleRecordSearchKeyDown}
              fullWidth
              margin="normal"
              placeholder="Ej: 13423 o 6618667"
              autoComplete="off"
              helperText="Presione Enter para buscar. Seleccione un expediente de la lista."
            />
            {searchLoading && (
              <Typography variant="body2" color="textSecondary" mb={1}>
                Buscando...
              </Typography>
            )}
            {searchTouched && searchResults && searchResults.length > 0 && (
              <List sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1, maxHeight: 180, overflow: 'auto' }}>
                {searchResults.map((record) => (
                  <ListItem key={record.id} disablePadding>
                    <ListItemButton onClick={() => handleSelectRecord(record)}>
                      <ListItemText
                        primary={`Expediente #${record.number} - ${record.applicant?.names || ''}`}
                        secondary={`Documento: ${record.applicant?.document || ''}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {searchTouched && searchResults && searchResults.length === 0 && !searchLoading && (
              <Typography variant="body2" color="textSecondary" mb={1}>
                No se encontraron expedientes con ese número o documento.
              </Typography>
            )}
            <input type="hidden" name="recordId" value={form.recordId} />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Plantilla de resolución</FormLabel>
              <select
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                disabled={templatesLoading}
                style={{ padding: 8, borderRadius: 4, borderColor: '#ccc', marginTop: 8 }}
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name || `Plantilla #${template.id}`}
                  </option>
                ))}
              </select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <CKEditor
                editor={ClassicEditor}
                data={form.content}
                onChange={handleContentChange}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Resuelto por:</FormLabel>
              <RadioGroup
                name="resolvedByDean"
                value={form.resolvedByDean ? "dean" : "council"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    resolvedByDean: e.target.value === "dean"
                  }))
                }
              >
                <FormControlLabel
                  value="dean"
                  control={<Radio />}
                  label="Decano"
                />
                <FormControlLabel
                  value="council"
                  control={<Radio />}
                  label="Consejo Directivo"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            {error && (
              <Typography color="error">
                {error?.message || error?.detail || error?.description || 'Ocurrió un error'}
              </Typography>
            )}
            <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/resoluciones')}
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
                {loading ? 'Saving...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={2000}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          La resolución ya está resuelta y no puede ser editada.
        </Alert>
        </Snackbar>
    </Box>
  );
}