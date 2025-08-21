import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField, FormControlLabel, Checkbox, Typography, Paper, List, ListItem, ListItemButton, ListItemText, FormControl, FormLabel, RadioGroup, Radio } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { createResolution, fetchNextResolutionNumber } from 'store/slices/resolutionsSlice';
import { searchRecords } from 'store/slices/recordsSlice';
import { fetchApplicants } from 'store/slices/applicantsSlice';
import { fetchTemplatesByPage } from 'store/slices/templatesSlice';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Chip, Grid, Tooltip } from '@mui/material';
import { EditOutlined } from '@ant-design/icons';

export default function CreateResolutionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const initialRecordId = location.state?.recordId || '';
  const initialRecordNumber = location.state?.recordNumber || '';

  const [form, setForm] = useState({
    issuedDate: new Date().toISOString().slice(0, 16),
    number: '',
    filePath: '',
    resolvedByDean: true,
    content: '',
    recordId: initialRecordId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [searchTouched, setSearchTouched] = useState(false);
  // Add this state for the selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Redux state for search results
  const searchResults = useSelector((state) => state.records.searchResults);
  const searchLoading = useSelector((state) => state.records.searchLoading);
  const applicants = useSelector((state) => state.applicants.list);
  const applicantsLoading = useSelector((state) => state.applicants.loading);
  const templates = useSelector((state) => state.templates.list);
  const templatesLoading = useSelector((state) => state.templates.loading);
  const nextResolutionNumber = useSelector(state => state.resolutions.nextResolutionNumber);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (event, editor) => {
    setForm((prev) => ({
      ...prev,
      content: editor.getData()
    }));
  };

  // Handle search input change
  const handleRecordSearchChange = (e) => {
    setRecordSearch(e.target.value);
    setSearchTouched(false);
    setForm((prev) => ({
      ...prev,
      recordId: ''
    }));
  };

  // Handle search on Enter key
  const handleRecordSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSearchRecords();
    }
  };

  // Search records by number or applicantDocument
  const handleSearchRecords = async () => {
    setSearchTouched(true);
    setError('');
    const value = recordSearch.trim();
    let body = {};
    if (value !== '') {
      // If value is a number, send as integer, else as string
      body = isNaN(Number(value))
        ? { number: value, applicantDocument: value }
        : { number: Number(value), applicantDocument: value };
    }
    dispatch(searchRecords(body));
  };

  // When user selects a record from the search results
  const handleSelectRecord = (record) => {
    setForm((prev) => ({
      ...prev,
      recordId: record.id
    }));
    setRecordSearch(
      `Expediente #${record.number} - ${record.applicant?.names || ''} (Documento: ${record.applicant?.document || ''})`
    );
    setSearchTouched(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await dispatch(
        createResolution({
          issuedDate: new Date(form.issuedDate).toISOString(),
          number: Number(form.number),
          resolvedByDean: form.resolvedByDean,
          content: form.content,
          recordId: form.recordId === '' ? null : Number(form.recordId),
          resolved: false // Always send as draft. We have a separate endpoint for resolving drafts.
        })
      ).unwrap();
      navigate(`/resoluciones/${result.id}`);
    } catch (err) {
      setError(err?.message || 'Error creating resolution');
    } finally {
      setLoading(false);
    }
  };

  // Clear search results when recordSearch changes and not touched
  useEffect(() => {
    if (!searchTouched) {
      dispatch({ type: 'records/clearSearchResults' });
    }
  }, [recordSearch, searchTouched, dispatch]);

  // Fetch applicants if not already present
  useEffect(() => {
    if (!applicants || applicants.length === 0) {
      dispatch(fetchApplicants());
    }
  }, [dispatch, applicants]);

  // Fetch templates on mount
  useEffect(() => {
    dispatch(fetchTemplatesByPage(1));
  }, [dispatch]);

  // Fetch next resolution number on mount
  useEffect(() => {
    dispatch(fetchNextResolutionNumber());
  }, [dispatch]);

  // Set the number field when nextResolutionNumber is available
  useEffect(() => {
    if (
      nextResolutionNumber &&
      typeof nextResolutionNumber === 'object' &&
      nextResolutionNumber.number !== undefined
    ) {
      setForm(prev => ({
        ...prev,
        number: String(nextResolutionNumber.number)
      }));
    }
  }, [nextResolutionNumber]);

  // Search by recordId to get the record and applicant info
  useEffect(() => {
    if (initialRecordId) {
      dispatch(searchRecords({ number: Number(initialRecordId) })).then((action) => {
        const record = action.payload?.[0];
        if (record) {
          setRecordSearch(
            `Expediente #${record.number} - ${record.applicant?.names || ''} (Documento: ${record.applicant?.document || ''})`
          );
          setForm((prev) => ({
            ...prev,
            recordId: record.id
          }));
        }
      });
    }
  }, [dispatch, initialRecordId]);

  // Search by recordNumber to get the record and applicant info
  useEffect(() => {
    if (initialRecordNumber) {
      dispatch(searchRecords({ number: Number(initialRecordNumber) })).then((action) => {
        const record = action.payload?.[0];
        if (record) {
          setRecordSearch(
            `Expediente #${record.number} - ${record.applicant?.names || ''} (Documento: ${record.applicant?.document || ''})`
          );
          setForm((prev) => ({
            ...prev,
            recordId: record.id
          }));
        }
      });
    }
  }, [dispatch, initialRecordNumber]);

  // Handle template selection
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Generar Resolución</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title="Esta resolución se creará como borrador. Puedes editar volver a este documento cuando necesites.">
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Número"
              name="number"
              type="number"
              value={form.number}
              onChange={handleChange}
              margin="normal"
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Issued Date"
              name="issuedDate"
              type="datetime-local"
              value={form.issuedDate}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
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
            {(searchLoading || applicantsLoading) && (
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
              <Typography color="error" variant="body2" mb={2}>
                {error}
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
                {loading ? 'Saving...' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}