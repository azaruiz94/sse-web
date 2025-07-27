import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRecordById } from "store/slices/recordsSlice";
import { fetchDependencies } from "store/slices/dependenciesSlice";
import { fetchStates } from "store/slices/statesSlice";
import { fetchApplicants } from "store/slices/applicantsSlice";
import { fetchUsers } from "store/slices/usersSlice";
import { Box, Typography, Paper, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from "@mui/material";

const ShowRecordPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const record = useSelector((state) => state.records.selectedRecord);
  const loading = useSelector((state) => state.records.loading);

  // Get dependencies, states, and applicants from redux
  const dependencies = useSelector((state) => state.dependencies.list);
  const states = useSelector((state) => state.states.list);
  const applicants = useSelector((state) => state.applicants.list);
  const users = useSelector((state) => state.users.list);

  // Helper functions
  const getDependencyName = (depId) => {
    const dep = dependencies.find((d) => d.id === depId);
    return dep ? dep.name : depId;
  };
  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId);
    return state ? state.name : stateId;
  };
  const getApplicantName = (applicantId) => {
    const applicant = applicants.find((a) => a.id === applicantId);
    return applicant ? applicant.names : applicantId;
  };
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchRecordById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (dependencies.length === 0) dispatch(fetchDependencies());
    if (states.length === 0) dispatch(fetchStates());
    if (applicants.length === 0) dispatch(fetchApplicants());
    if (users.length === 0) dispatch(fetchUsers());
  }, []); // Only run once on mount

  if (
    loading ||
    !record ||
    dependencies.length === 0 ||
    states.length === 0 ||
    applicants.length === 0 ||
    users.length === 0
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Record Details
        </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
                <TextField
              label="Solicitante"
              value={getApplicantName(record.applicantId)}
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
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label="Motivo de solicitud/nota"
              value={record.motive}
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
          
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="File Path"
              value={record.filePath}
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
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl component="fieldset" margin="dense">
              <FormLabel component="legend">Tipo de solicitud</FormLabel>
              <RadioGroup row value={record.internal ? "internal" : "external"}>
                <FormControlLabel
                  value="internal"
                  control={<Radio />}
                  label="Interno"
                  disabled
                />
                <FormControlLabel
                  value="external"
                  control={<Radio />}
                  label="Externo"
                  disabled
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          
        </Grid>
        {Array.isArray(record.recordHistory) && record.recordHistory.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Record History
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Updated Date</strong></TableCell>
                    <TableCell><strong>Previous Dependency</strong></TableCell>
                    <TableCell><strong>Next Dependency</strong></TableCell>
                    <TableCell><strong>Previous State</strong></TableCell>
                    <TableCell><strong>Next State</strong></TableCell>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Comment</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {record.recordHistory.map((history) => (
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
      </Paper>
    </Box>
  );
};

export default ShowRecordPage;