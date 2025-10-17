import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRecordById, forwardRecord, fetchRecordFileUrl } from "store/slices/recordsSlice";
import { fetchDependencies } from "store/slices/dependenciesSlice";
import { fetchStates } from "store/slices/statesSlice";
import { fetchUsers } from "store/slices/usersSlice";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  Button
} from "@mui/material";
import { useSnackbar } from "notistack";
import ForwardRecordModal from "./forward-record-modal";

const ShowRecordPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const record = useSelector((state) => state.records.selectedRecord);
  const loading = useSelector((state) => state.records.loading);
  const fileUrl = useSelector(state => state.records.fileUrl);

  // Get dependencies, states, and users from redux
  const dependencies = useSelector((state) => state.dependencies.list);
  const states = useSelector((state) => state.states.list);
  const users = useSelector((state) => state.users.list);

  // Modal state
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardLoading, setForwardLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  // Helper functions
  const getDependencyName = (depId) => {
    const dep = dependencies.find((d) => d.id === depId);
    return dep ? dep.name : depId;
  };
  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId);
    return state ? state.name : stateId;
  };
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : userId;
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchRecordById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (dependencies.length === 0) dispatch(fetchDependencies());
    if (states.length === 0) dispatch(fetchStates());
    if (users.length === 0) dispatch(fetchUsers());
  }, []); // Only run once on mount

  // Clear fileUrl after 5 minutes or when unmounting
  useEffect(() => {
    let timer;
    if (fileUrl) {
      timer = setTimeout(() => {
        dispatch({ type: 'records/clearFileUrl' });
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fileUrl, dispatch]);

  if (
    loading ||
    !record ||
    dependencies.length === 0 ||
    states.length === 0 ||
    users.length === 0
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle forward submit
  const handleForwardSubmit = async (payload) => {
    setForwardLoading(true);
    try {
      await dispatch(forwardRecord(payload)).unwrap();
      enqueueSnackbar("Expediente remitido correctamente", { variant: "success" });
      setForwardModalOpen(false);
      // Optionally refetch the record to update history
      dispatch(fetchRecordById(record.id));
    } catch (err) {
      enqueueSnackbar("Error al remitir expediente", { variant: "error" });
    } finally {
      setForwardLoading(false);
    }
  };

  // --- NEW: Handle resolve button click ---
  const handleResolveClick = () => {
    navigate('/resoluciones/create', { state: { recordNumber: record.number } });
  };

  const handleViewOrDownload = async () => {
    setFileLoading(true);
    await dispatch(fetchRecordFileUrl(record.id));
    setFileLoading(false);
  };

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="flex-end" mb={2} gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleResolveClick}
          >
            Generar resolución
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setForwardModalOpen(true)}
          >
            Remitir expediente
          </Button>
        </Box>
        <Typography variant="h5" gutterBottom>
          Detalles del expediente
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label="Solicitante"
              value={
                record.applicant
                  ? `${record.applicant.names || ''} (${record.applicant.document || ''})`
                  : ''
              }
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Numero de expediente"
              value={record.number}
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Motivo de solicitud/nota"
              value={record.motive}
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Dependencia actual"
              value={getDependencyName(record.dependencyId)}
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4}}>
            <TextField
              label="Estado actual"
              value={getStateName(record.stateId)}
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Fecha de registro"
              value={new Date(record.registeredDate).toLocaleString()}
              fullWidth
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <FormControl component="fieldset" margin="dense">
              <FormLabel component="legend">Tipo de solicitud</FormLabel>
              <RadioGroup
                row={false} // Stack vertically
                value={record.internal ? "internal" : "external"}
              >
                <FormControlLabel
                  value="internal"
                  control={<Radio />}
                  label="Interna"
                  disabled
                />
                <FormControlLabel
                  value="external"
                  control={<Radio />}
                  label="Externa"
                  disabled
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {Array.isArray(record.recordHistory) && record.recordHistory.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Historial del expediente
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Dependencia Anterior</strong></TableCell>
                    <TableCell><strong>Dependencia Destino</strong></TableCell>
                    <TableCell><strong>Estado Anterior</strong></TableCell>
                    <TableCell><strong>Estado Posterior</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Comentario</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...record.recordHistory]
                    .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>{new Date(history.updatedDate).toLocaleString()}</TableCell>
                        <TableCell>{getDependencyName(history.previousDependencyId)}</TableCell>
                        <TableCell>{getDependencyName(history.nextDependencyId)}</TableCell>
                        <TableCell>{getStateName(history.previousStateId)}</TableCell>
                        <TableCell>{getStateName(history.nextStateId)}</TableCell>
                        <TableCell>{getUserName(history.userId)}</TableCell>
                        <TableCell>{history.comment}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {record.filePath && (
          <Box mt={2} mb={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleViewOrDownload}
              disabled={fileLoading}
            >
              {fileLoading ? 'Generando enlace...' : 'Ver documento adjunto'}
            </Button>
            {fileUrl && (
              <>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 16, textDecoration: 'none' }}
                >
                  <Button variant="contained" color="success">
                    Abrir PDF
                  </Button>
                </a>
                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                  Por seguridad, el enlace será válido sólo por 5 minutos.
                </Typography>
              </>
            )}
          </Box>
        )}
      </Paper>
      <ForwardRecordModal
        open={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        onSubmit={handleForwardSubmit}
        record={record}
        dependencies={dependencies}
        states={states}
        loading={forwardLoading}
      />
    </Box>
  );
};

export default ShowRecordPage;