import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, fetchRoleById } from '../../store/slices/rolesSlice';
import { DataGrid } from '@mui/x-data-grid';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import IconButton from '@mui/material/IconButton';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import ShowRoleModal from './show-role-modal';
import EditRoleModal from './edit-role-modal';

const RolesTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  const roles = useSelector((state) => state.roles.list);
  const total = useSelector((state) => state.roles.total);
  const page = useSelector((state) => state.roles.page);
  const loading = useSelector((state) => state.roles.loading);
  const selectedRole = useSelector((state) => state.roles.selectedRole);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const handleShow = useCallback(async (id) => {
    await dispatch(fetchRoleById(id));
    setModalOpen(true);
  }, [dispatch]);

  const handleEdit = (row) => {
    setEditingRole(row);
    setEditModalOpen(true);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchRoles(page));
    }
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Roles
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={roles}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              loading={loading}
              pageSizeOptions={[5]}
              paginationModel={{ page, pageSize: 5 }}
              onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchRoles(newPage));
              }}
              disableSelectionOnClick
              getRowId={(row) => row.id}
            />
          </div>
        )}

        <ShowRoleModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          role={selectedRole}
        />
        <EditRoleModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          role={editingRole}
        />
      </CardContent>
    </Card>
  );
});

export default RolesTable;