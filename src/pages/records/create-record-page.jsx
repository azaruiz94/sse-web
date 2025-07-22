import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField, MenuItem, CircularProgress, Typography } from '@mui/material';
import { fetchApplicants, searchApplicants } from 'store/slices/applicantsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';
import { createRecord, fetchNextRecordNumber } from 'store/slices/recordsSlice';
import { useSnackbar } from 'notistack';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function CreateRecordPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Redux state
  const applicants = useSelector(state => state.applicants.list);
  const applicantsLoading = useSelector(state => state.applicants.loading);
  const states = useSelector(state => state.states.list);
  const dependencies = useSelector(state => state.dependencies.list);
  const user = useSelector(state => state.auth.user);
  const nextRecordNumber = useSelector(state => state.records.nextRecordNumber);

  // Local state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [number, setNumber] = useState('');
  const [internal, setInternal] = useState(false);
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
    console.log('nextRecordNumber:', nextRecordNumber);
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
  const decanatoDep = dependencies.find(d => d.name === 'Decanato');
  const enTramiteState = states.find(s => s.name === 'En tramite');

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
      // Create the record (assume API returns the new record with its id)
      const action = await dispatch(createRecord(recordPayload));
      if (createRecord.fulfilled.match(action)) {
        enqueueSnackbar('Expediente creado exitosamente', { variant: 'success' });
        // Redirect or reset form as needed
      } else {
        throw new Error(action.error?.message || 'Error al crear expediente');
      }
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Nuevo Expediente</Typography>

      {/* Number (auto-incremented, read-only) */}
      <TextField
        label="Número"
        value={number}
        margin="normal"
        fullWidth
        InputProps={{ readOnly: true }}
      />

      {/* Internal (checkbox) */}
      <FormControlLabel
        control={
          <Checkbox
            checked={internal}
            onChange={e => setInternal(e.target.checked)}
            color="primary"
          />
        }
        label="Interno"
        sx={{ mb: 2 }}
      />

      {/* Motive */}
      <TextField
        label="Motivo"
        value={motive}
        onChange={e => setMotive(e.target.value)}
        margin="normal"
        fullWidth
        required
      />

      {/* File Path */}
      <TextField
        label="Ruta del archivo"
        value={filePath}
        onChange={e => setFilePath(e.target.value)}
        margin="normal"
        fullWidth
        required
      />

      {/* Applicant select with search */}
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

      {/* State (Recibido) - disabled */}
      <TextField
        label="Estado"
        value={recibidoState ? recibidoState.name : ''}
        margin="normal"
        fullWidth
        disabled
      />

      {/* Dependency (Mesa de entrada) - disabled */}
      <TextField
        label="Dependencia"
        value={mesaEntradaDep ? mesaEntradaDep.name : ''}
        margin="normal"
        fullWidth
        disabled
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        disabled={!selectedApplicant || !motive || !filePath}
      >
        Crear Expediente
      </Button>
    </Box>
  );
}