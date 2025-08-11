import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResolutionsByPage } from 'store/slices/resolutionsSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ResolutionsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resolutions = useSelector((state) => state.resolutions.list);
  const total = useSelector((state) => state.resolutions.totalElements || 0);
  const loading = useSelector((state) => state.resolutions.loading);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchResolutionsByPage(page + 1));
    }
  }));

  useEffect(() => {
    dispatch(fetchResolutionsByPage(page + 1));
  }, [dispatch, page]);

  const columns = [
    { field: 'number', headerName: 'Number', width: 120 },
    {
      field: 'issuedDate',
      headerName: 'Issued Date',
      width: 180,
      valueFormatter: (params) => {
        const date = params ? new Date(params) : null;
        return date ? date.toLocaleDateString() : '';
      }
    },
    {
      field: 'resolvedByDean',
      headerName: 'Resuelto por:',
      width: 160,
      valueGetter: (params) => (params ? 'Decano' : 'Consejo Directivo')
    },
    {
      field: 'resolved',
      headerName: 'Estado',
      width: 120,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label="Resuelto"
            size="small"
            sx={{
              bgcolor: (theme) => theme.palette.success.lighter,
              color: (theme) => theme.palette.success.dark,
              fontWeight: 'bold',
              fontSize: 13,
              pointerEvents: 'none'
            }}
          />
        ) : (
          <Chip
            label="Borrador"
            size="small"
            sx={{
              bgcolor: (theme) => theme.palette.warning.lighter,
              color: (theme) => theme.palette.warning.dark,
              fontWeight: 'bold',
              fontSize: 13,
              pointerEvents: 'none'
            }}
          />
        )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => navigate(`/resoluciones/${params.row.id}`)}
        >
          <EyeOutlined />
        </IconButton>
      )
    }
  ];

  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={resolutions}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                setPage(newPage);
                dispatch(fetchResolutionsByPage(newPage + 1));
              }}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{
                noRowsLabel: 'No hay resoluciones disponibles.'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ResolutionsTable;