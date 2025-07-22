import {
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDependencies } from '../../store/slices/dependenciesSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  CircularProgress,
  Box
} from '@mui/material';

const DependenciesTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const dependencies = useSelector((state) => state.dependencies.list);
  const total = useSelector((state) => state.dependencies.total);
  const page = useSelector((state) => state.dependencies.page);
  const loading = useSelector((state) => state.dependencies.loading);
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 }
    // Add more columns as needed
  ];

  useEffect(() => {
    dispatch(fetchDependencies());
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchDependencies(page));
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
              rows={dependencies}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[50]}
              paginationModel={{ page, pageSize: 50 }}
              onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchDependencies(newPage));
              }}
              disableSelectionOnClick
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default DependenciesTable;