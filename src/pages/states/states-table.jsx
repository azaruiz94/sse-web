import {
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates } from '../../store/slices/statesSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  CircularProgress,
  Box
} from '@mui/material';

const StatesTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const states = useSelector((state) => state.states.list);
  const total = useSelector((state) => state.states.total);
  const page = useSelector((state) => state.states.page);
  const loading = useSelector((state) => state.states.loading);
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 }
  ];

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchStates(page));
    }
  }));

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
              rows={states}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[50]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchStates(newPage));
              }}
              disableSelectionOnClick
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default StatesTable;