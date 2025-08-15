import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecordsByPage, searchRecords } from 'store/slices/recordsSlice';
import { fetchApplicants } from 'store/slices/applicantsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material';
import {
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RecordsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const records = useSelector((state) =>
    searchTerm.trim() ? state.records.searchResults : state.records.records
  );
  const total = useSelector((state) =>
    searchTerm.trim() ? state.records.searchResults?.length || 0 : state.records.totalElements || 0
  );
  const loading = useSelector((state) => state.records.loading);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);

  const states = useSelector((state) => state.states.list);
  const dependencies = useSelector((state) => state.dependencies.list);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setSearchTerm('');
      setPage(0);
      dispatch(fetchRecordsByPage(1));
    },
    searchRecords: (term) => {
      setSearchTerm(term);
      setPage(0);
      let payload = {};
      if (term.trim()) {
        payload.number = Number(term);
        payload.applicantDocument = term;
        dispatch(searchRecords(payload));
      } else {
        dispatch(fetchRecordsByPage(1));
      }
    }
  }));

  useEffect(() => {
    if (!searchTerm.trim()) {
      dispatch(fetchRecordsByPage(page + 1));
    }
    // If searchTerm is set, searchRecords will handle fetching
  }, [dispatch, page, searchTerm]);

  useEffect(() => {
    dispatch(fetchApplicants());
    dispatch(fetchStates());
    dispatch(fetchDependencies());
  }, [dispatch]);

  const handleShow = useCallback((id) => {
    navigate(`/expedientes/${id}`);
  }, [navigate]);

  const columns = [
    { field: 'number', headerName: 'Number', width: 120 },
    {
      field: 'applicant',
      headerName: 'Applicant',
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
      headerName: 'State',
      width: 120,
      valueGetter: (params) => {
        const state = states.find(s => s.id === params);
        return state ? state.name : params;
      }
    },
    {
      field: 'dependencyId',
      headerName: 'Dependency',
      width: 150,
      valueGetter: (params) => {
        const dep = dependencies.find(d => d.id === params);
        return dep ? dep.name : params;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
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
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={records}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                setPage(newPage);
                dispatch(fetchRecordsByPage(newPage + 1));
              }}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{
                noRowsLabel: 'No hay expedientes disponibles.'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default RecordsTable;