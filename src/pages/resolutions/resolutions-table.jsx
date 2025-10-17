import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResolutionsByPage, searchResolutions } from 'store/slices/resolutionsSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { EyeOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ResolutionsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Use searchResults if searching, otherwise use list
  const resolutions = useSelector((state) =>
    searchTerm.trim() ? state.resolutions.searchResults : state.resolutions.list
  );
  const total = useSelector((state) =>
    searchTerm.trim() ? state.resolutions.searchResults?.length || 0 : state.resolutions.totalElements || 0
  );
  const loading = useSelector((state) => state.resolutions.loading);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setSearchTerm('');
      setPage(0);
      dispatch(fetchResolutionsByPage(1));
    },
    searchResolutions: (term) => {
      setSearchTerm(term);
      setPage(0);
      let payload = {};
      if (term.trim()) {
        payload.number = Number(term);
        payload.applicantDocument = term;
        dispatch(searchResolutions(payload));
      } else {
        dispatch(fetchResolutionsByPage(1));
      }
    }
  }));

  useEffect(() => {
    if (!searchTerm.trim()) {
      dispatch(fetchResolutionsByPage(page + 1));
    }
    // If searchTerm is set, searchResolutions will handle fetching
  }, [dispatch, page, searchTerm]);

  const columns = [
    { field: 'number', headerName: 'Número', width: 120 },
    {
      field: 'issuedDate',
      headerName: 'Fecha de emisión',
      width: 180,
      valueFormatter: (params) => {
        try {
          const v = params?.value ?? params;
          if (!v) return '';
          const date = new Date(v);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleDateString();
        } catch (e) {
          return '';
        }
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
      renderCell: (params) => {
        const row = params.row || {};
        if (row.resolved) {
          return (
            <Chip
              icon={<CheckOutlined />}
              label="Resuelta"
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.success.lighter,
                color: (theme) => theme.palette.success.dark,
                fontWeight: 'bold',
                fontSize: 13,
                pointerEvents: 'none'
              }}
            />
          );
        }
        if (row.generated) {
          return (
            <Chip
              label="Generada"
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.success.lighter,
                color: (theme) => theme.palette.success.dark,
                fontWeight: 'bold',
                fontSize: 13,
                pointerEvents: 'none'
              }}
            />
          );
        }
        return (
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
        );
      }
    },
    {
      field: 'recordSummary',
      headerName: 'Nro. expediente',
      width: 220,
      valueGetter: (params) =>
        params
          ? `${params.number ? params.number : '-'}`
          : '-'
    },
    {
      field: 'recordSummarySolicitante',
      headerName: 'Solicitante',
      width: 220,
      renderCell: (params) => {
        const summary = params.row?.recordSummary;
        return summary
          ? `${summary.applicantNames} (${summary.applicantDocument})`
          : '-';
      }
    },
    
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => navigate(`/resoluciones/${params.row.id}`)}>
            <EyeOutlined />
          </IconButton>
          {!params.row.resolved && (
            <IconButton color="secondary" onClick={() => navigate(`/resoluciones/${params.row.id}/edit`)}>
            <EditOutlined />
          </IconButton>
          )}
        </>
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