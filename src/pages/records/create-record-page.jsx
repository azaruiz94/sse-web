import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField, Paper, Typography, Grid, CircularProgress, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { fetchApplicants, searchApplicants } from 'store/slices/applicantsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';
import { createRecord, fetchNextRecordNumber } from 'store/slices/recordsSlice';
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
  const nextRecordNumber = useSelector(state => state.records.nextRecordNumber);

  // Local state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [number, setNumber] = useState('');
  const [internal, setInternal] = useState(true); // true = "Interno" checked by default
  const [motive, setMotive] = useState('');
  const [filePath, setFilePath] = useState('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchApplicants());
    dispatch(fetchStates());
    dispatch(fetchDependencies());
    dispatch(fetchNextRecordNumber());
  }, [dispatch]);

  // Update local number state when nextRecordNumber changes
  useEffect(() => {
    if (nextRecordNumber !== null && nextRecordNumber !== undefined) {
      setNumber(String(nextRecordNumber));
    }
  }, [nextRecordNumber]);

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

    const now = new Date().toISOString();

    // Prepare record payload
    const recordPayload = {
      number,
      registeredDate: now,
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
        enqueueSnackbar('Expediente creado exitosamente', { variant: 'success' });
        // Redirect to ShowRecord page
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
          <Grid item size={{ xs: 12, md: 8 }}>
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
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              label="Número"
              value={number}
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 8 }}>
            <TextField
              label="Motivo de solicitud/nota"
              value={motive}
              onChange={e => setMotive(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              label="Ruta del archivo"
              value={filePath}
              onChange={e => setFilePath(e.target.value)}
              margin="normal"
              fullWidth
              required
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              label="Estado"
              value={recibidoState ? recibidoState.name : ''}
              margin="normal"
              fullWidth
              disabled
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              label="Dependencia"
              value={mesaEntradaDep ? mesaEntradaDep.name : ''}
              margin="normal"
              fullWidth
              disabled
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 12 }}>
            <FormControl component="fieldset" margin="dense" fullWidth>
              <FormLabel component="legend">Tipo de expediente</FormLabel>
              <RadioGroup
                row
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
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={!selectedApplicant || !motive || !filePath}
        >
          Crear Expediente
        </Button>
      </Paper>
    </Box>
  );
}