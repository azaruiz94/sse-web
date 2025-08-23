import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, Chip } from '@mui/material';
import { EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAuditLogsByPage } from 'store/slices/auditSlice';

export default function AuditTable({ auditLogs, totalElements, loading, onViewAudit }) {
  const [page, setPage] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAuditLogsByPage(page + 1));
  }, [dispatch, page]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'entityName', headerName: 'Entidad', width: 120 },
    {
      field: 'action',
      headerName: 'Acción',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        let color, bgColor, label;
        switch (params.value) {
          case 'CREATE':
            color = (theme) => theme.palette.success.dark;
            bgColor = (theme) => theme.palette.success.lighter;
            label = 'CREATE';
            break;
          case 'UPDATE':
            color = (theme) => theme.palette.warning.dark;
            bgColor = (theme) => theme.palette.warning.lighter;
            label = 'UPDATE';
            break;
          case 'DELETE':
            color = (theme) => theme.palette.error.dark;
            bgColor = (theme) => theme.palette.error.lighter;
            label = 'DELETE';
            break;
          default:
            color = undefined;
            bgColor = undefined;
            label = params.value;
        }
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              bgcolor: bgColor,
              color: color,
              fontWeight: 'bold',
              fontSize: 13,
              pointerEvents: 'none'
            }}
          />
        );
      }
    },
    { field: 'changedBy', headerName: 'Usuario', width: 160 },
    {
      field: 'changedAt',
      headerName: 'Fecha',
      width: 180,
      valueGetter: (params) =>
        params ? new Date(params * 1000).toLocaleString()
          : ''
    },
    {
      field: 'actions',
      headerName: 'Ver',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => onViewAudit(params.row.id)}>
          <EyeOutlined />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ height: 420, width: '100%' }}>
      <DataGrid
        rows={auditLogs || []}
        columns={columns}
        paginationMode="server"
        rowCount={totalElements}
        loading={loading}
        pageSizeOptions={[5]}
        paginationModel={{ page, pageSize: 5 }}
        onPaginationModelChange={({ page: newPage }) => setPage(newPage)}
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: 'No hay registros de auditoría.'
        }}
      />
    </Box>
  );
}