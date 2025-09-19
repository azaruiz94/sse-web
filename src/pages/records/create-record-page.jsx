import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField, Paper, Typography, Grid, CircularProgress, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { fetchApplicants, searchApplicants } from 'store/slices/applicantsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';
import { createRecord, uploadRecordPdf } from 'store/slices/recordsSlice';
import { useSnackbar } from 'notistack';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';

export default function CreateRecordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Redux state
  const applicants = useSelector(state => state.applicants.list);
  const applicantsLoading = useSelector(state => state.applicants.loading);
  const states = useSelector(state => state.states.list);
  const dependencies = useSelector(state => state.dependencies.list);
  const loading = useSelector(state => state.records.loading);
  const error = useSelector(state => state.records.error);

  // Local state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [internal, setInternal] = useState(true); // true = "Interno" checked by default
  const [motive, setMotive] = useState('');
  const [filePath, setFilePath] = useState('');
  // server will assign number and registeredDate
  const [pdfFile, setPdfFile] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchApplicants());
    dispatch(fetchStates());
    dispatch(fetchDependencies());
  }, [dispatch]);


  // Search applicants
  useEffect(() => {
    if (searchTerm) {
      dispatch(searchApplicants({ term: searchTerm, page: 0 }));
    }
  }, [searchTerm, dispatch]);

  // Get default state and dependency IDs
  const recibidoState = states.find(s => s.name === 'Recibido');
  const mesaEntradaDep = dependencies.find(d => d.name === 'Mesa de entrada');

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApplicant || !recibidoState || !mesaEntradaDep) {
      enqueueSnackbar('Faltan datos requeridos.', { variant: 'error' });
      return;
    }

    // Prepare record payload
    const recordPayload = {
      // number and registeredDate are assigned by the server
      filePath,
      internal,
      applicantId: selectedApplicant.id,
      stateId: recibidoState.id,
      motive,
      dependencyId: mesaEntradaDep.id
    };

    try {
      const action = await dispatch(createRecord(recordPayload));
      if (createRecord.fulfilled.match(action)) {
        // Upload PDF if selected
        if (pdfFile) {
          const recordId = action.payload.id;
          const formData = new FormData();
          formData.append('file', pdfFile);
          const uploadAction = await dispatch(uploadRecordPdf({ id: recordId, file: formData }));
          if (uploadRecordPdf.fulfilled.match(uploadAction)) {
            enqueueSnackbar('PDF subido correctamente', { variant: 'success' });
          } else {
            enqueueSnackbar(uploadAction.error?.message || 'Error al subir PDF', { variant: 'warning' });
          }
        }
        enqueueSnackbar('Expediente creado exitosamente', { variant: 'success' });
        navigate(`/expedientes/${action.payload.id}`);
      } else {
        throw new Error(action.error?.message || 'Error al crear expediente');
      }
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Nuevo Expediente</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Autocomplete
              options={applicants}
              getOptionLabel={(option) => option.names || ''}
              loading={applicantsLoading}
              value={selectedApplicant}
              onChange={(_, value) => setSelectedApplicant(value)}
              onInputChange={(_, value) => setSearchTerm(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Solicitante"
                  required
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {applicantsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Motivo de solicitud/nota"
              value={motive}
              onChange={e => setMotive(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Dependencia"
              value={mesaEntradaDep ? mesaEntradaDep.name : ''}
              margin="normal"
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Estado"
              value={recibidoState ? recibidoState.name : ''}
              margin="normal"
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <FormControl component="fieldset" margin="dense" fullWidth>
              <FormLabel component="legend">Tipo de expediente</FormLabel>
              <RadioGroup
                value={internal ? "true" : "false"}
                onChange={e => setInternal(e.target.value === "true")}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Interno"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Externo"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Subir PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={e => setPdfFile(e.target.files[0])}
              />
            </Button>

            {pdfFile ? (
              <>
                <Typography variant="body2" mt={1}>
                  Archivo seleccionado: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tamaño máximo permitido: 5 MB. Solo se permiten archivos PDF.
                </Typography>
              </>
            ) : (
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Tamaño máximo permitido: 5 MB. Solo se permiten archivos PDF.
              </Typography>
            )}
          </Grid>
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
              onClick={() => navigate('/expedientes')}
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
              {loading ? 'Saving...' : 'Crear Expediente'}
            </Button>
          </Box>
        </Grid>
      </Paper>
    </Box>
  );
}