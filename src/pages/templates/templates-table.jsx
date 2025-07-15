import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplatesByPage } from 'store/slices/templatesSlice';
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

const TemplatesTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const templates = useSelector((state) => state.templates.list);
  const total = useSelector((state) => state.templates.totalElements || 0);
  const page = useSelector((state) => state.templates.page - 1 || 0);
  const loading = useSelector((state) => state.templates.loading);

  const [pageSize] = useState(5);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchTemplatesByPage(page + 1));
    }
  }));

  useEffect(() => {
    dispatch(fetchTemplatesByPage(page + 1));
  }, [dispatch, page]);

  const handleShow = useCallback((id) => {
    navigate(`/templates/${id}`);
  }, [navigate]);

  const handleEdit = useCallback((row) => {
    navigate(`/templates/${row.id}/edit`);
  }, [navigate]);

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 300 },
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
          Plantillas
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={templates}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchTemplatesByPage(newPage + 1));
              }}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{
                noRowsLabel: 'No hay plantillas disponibles.'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default TemplatesTable;