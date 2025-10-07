import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Card, CardContent, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchPendingRecordsByPage } from 'store/slices/recordsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';

export default function PendingRecordsCard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pending = useSelector((state) => state.records.pendingRecords || []);
  const total = useSelector((state) => state.records.pendingTotal || 0);
  const loading = useSelector((state) => state.records.loading);
  const states = useSelector((state) => state.states.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const statesLoading = useSelector((state) => state.states.loading);
  const dependenciesLoading = useSelector((state) => state.dependencies.loading);

  const [page, setPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    dispatch(fetchPendingRecordsByPage(1));
  }, [dispatch]);

  // Ensure states and dependencies are loaded for display; load only when empty
  useEffect(() => {
    if ((!states || states.length === 0) && !statesLoading) {
      dispatch(fetchStates());
    }
    if ((!dependencies || dependencies.length === 0) && !dependenciesLoading) {
      dispatch(fetchDependencies());
    }
  }, [dispatch, states?.length, dependencies?.length, statesLoading, dependenciesLoading]);

  useEffect(() => {
    // fetch when pagination changes (server pagination expects 1-based page)
    dispatch(fetchPendingRecordsByPage(page + 1));
  }, [dispatch, page]);

  // lists are loaded globally in App.jsx

  const handleShow = useCallback((id) => {
    navigate(`/expedientes/${id}`);
  }, [navigate]);

  const getDependencyName = useCallback((depId) => {
    const dep = dependencies.find((d) => d.id === depId);
    return dep ? dep.name : depId;
  }, [dependencies]);

  const getStateName = useCallback((stateId) => {
    const s = states.find((st) => st.id === stateId);
    return s ? s.name : stateId;
  }, [states]);

  const columns = [
    { field: 'number', headerName: 'Nro. expediente', width: 120 },
    {
      field: 'applicant',
      headerName: 'Solicitante',
      width: 200,
      valueGetter: (params) => {
        const applicant = params;
        if (applicant) {
          return `${applicant.names || ''} (${applicant.document || ''})`;
        }
        return '';
      }
    },
    {
      field: 'stateId',
      headerName: 'Estado actual',
      width: 120,
      valueGetter: (params) => {
        const state = states.find(s => s.id === params);
        return state ? state.name : params;
      }
    },
    {
      field: 'dependencyId',
      headerName: 'Dependencia actual',
      width: 150,
      valueGetter: (params) => {
        const dep = dependencies.find(d => d.id === params);
        return dep ? dep.name : params;
      }
    },
    {
      field: 'registeredDate',
      headerName: 'Fecha de registro',
      width: 150,
      valueGetter: (params) =>
        params
          ? new Date(params).toLocaleString()
          : ''
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleShow(params.row.id)}>
            <EyeOutlined />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Expedientes Pendientes</Typography>
        </Box>
        {loading || !(states && states.length > 0 && dependencies && dependencies.length > 0) ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={pending}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={({ page: newPage }) => setPage(newPage)}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{ noRowsLabel: 'No hay expedientes pendientes.' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
