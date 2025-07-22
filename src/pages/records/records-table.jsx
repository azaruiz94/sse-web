import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecordsByPage } from 'store/slices/recordsSlice';
import { fetchApplicants } from 'store/slices/applicantsSlice';
import { fetchStates } from 'store/slices/statesSlice';
import { fetchDependencies } from 'store/slices/dependenciesSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material';
import {
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RecordsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const records = useSelector((state) => state.records.records);
  const total = useSelector((state) => state.records.totalElements || 0);
  const loading = useSelector((state) => state.records.loading);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);

  const applicants = useSelector((state) => state.applicants.list);
  const states = useSelector((state) => state.states.list);
  const dependencies = useSelector((state) => state.dependencies.list);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchRecordsByPage(page + 1));
    }
  }));

  useEffect(() => {
    dispatch(fetchRecordsByPage(page + 1));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchApplicants());
    dispatch(fetchStates());
    dispatch(fetchDependencies());
  }, [dispatch]);

  const handleShow = useCallback((id) => {
    navigate(`/records/${id}`);
  }, [navigate]);

  const handleEdit = useCallback((row) => {
    navigate(`/records/${row.id}/edit`);
  }, [navigate]);

  const columns = [
    { field: 'number', headerName: 'Number', width: 120 },
    {
      field: 'applicantId',
      headerName: 'Applicant',
      width: 150,
      valueGetter: (params) => {
        const applicant = applicants.find(a => a.id === params);
        return applicant ? applicant.names : params;
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
          <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
            <EditOutlined />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Expedientes
        </Typography>

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