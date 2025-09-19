import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  deleteUser,
  searchUsers,
  fetchUserById
} from '../../store/slices/usersSlice';
import { fetchRoles } from '../../store/slices/rolesSlice';
import { fetchDependencies } from '../../store/slices/dependenciesSlice';
import ShowUserModal from './show-user-modal';
import EditUserModal from './edit-user-modal';
import DeleteUserModal from './delete-user-modal';
import { DataGrid } from '@mui/x-data-grid';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';

const UsersTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const roles = useSelector((state) => state.roles.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const users = useSelector((state) => state.users.list);
  const total = useSelector((state) => state.users.total);
  const page = useSelector((state) => state.users.page);
  const loading = useSelector((state) => state.users.loading);
  const authUser = useSelector((state) => state.auth.user);
  const selectedUser = useSelector((state) => state.users.selectedUser);

  // Permission checks
  const hasVerRol = authUser?.permissions?.includes('VER_ROL');
  const hasVerDependencia = authUser?.permissions?.includes('VER_DEPENDENCIA');
  const hasVerUsuario = authUser?.permissions?.includes('VER_USUARIO');

  useEffect(() => {
    if (hasVerRol) {
      dispatch(fetchRoles());
    }
    if (hasVerDependencia) {
      dispatch(fetchDependencies());
    }
  }, [dispatch, hasVerRol, hasVerDependencia]);

  useEffect(() => {
    if (hasVerUsuario) {
      dispatch(fetchUsers(page));
    }
  }, [dispatch, page, hasVerUsuario]);

  const [modalOpen, setModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleShow = useCallback(async (id) => {
    await dispatch(fetchUserById(id));
    setModalOpen(true);
  }, [dispatch]);

  const handleEdit = (row) => {
    setEditingUser(row);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setUserToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err || 'Failed to delete user', { variant: 'error' });
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => {
      dispatch(fetchUsers(page));
    },
    searchUsers: (term) => {
      if (term.trim()) {
        dispatch(searchUsers({ term, page: 0 }));
      } else {
        dispatch(fetchUsers(0)); // fallback to full list
      }
    }
  }));

  const columns = [
    { field: 'firstName', headerName: 'Nombre', width: 150 },
    { field: 'lastName', headerName: 'Apellido', width: 150 },
    { field: 'email', headerName: 'Correo Electrónico', width: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 140 },
    { field: 'document', headerName: 'Documento', width: 140 },
    ...(hasVerRol ? [{
      field: 'roleIds',
      headerName: 'Roles',
      width: 200,
      valueGetter: (params) => {
        if (!Array.isArray(params) || roles.length === 0) return '-';
        const names = params
          .map(id => {
            const role = roles.find(r => String(r.id) === String(id));
            return role ? role.name : id;
          })
          .filter(Boolean);
        return names.length ? names.join(', ') : '-';
      }
    }] : []),
    ...(hasVerDependencia ? [{
      field: 'dependencyId',
      headerName: 'Dependencia',
      width: 180,
      valueGetter: (params) => {
        const dep = dependencies.find(d => String(d.id) === String(params));
        return dep ? dep.name : params ?? '-';
      }
    }] : []),
    { field: 'enabled', headerName: 'Activado', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Acciones',
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
          <IconButton color="error" onClick={() => handleDeleteClick(params.row)}>
            <DeleteOutlined />
          </IconButton>
        </>
      )
    }
  ];

  if (!hasVerUsuario) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Users
          </Typography>
          <Box display="flex" justifyContent="center" mt={4}>
            <Alert severity="error">
              No tienes permiso para ver usuarios. Si crees que esto es un error, contacta al administrador.
            </Alert>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Show warning if missing role or dependency permissions */}
        {(!hasVerRol || !hasVerDependencia) && (
          <Box mb={2}>
            <Alert severity="error">
              No tienes permiso para ver roles o dependencias. Si crees que esto es un error, contacta al administrador.
            </Alert>
          </Box>
        )}
        <div style={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            paginationMode="server"
            rowCount={total || 0}
            loading={loading}
            pageSizeOptions={[5]}
            paginationModel={{ page, pageSize: 5 }}
            onPaginationModelChange={({ page: newPage }) => {
                dispatch(fetchUsers(newPage));
            }}
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        </div>

        <ShowUserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
        />
        <EditUserModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={editingUser}
        />
        <DeleteUserModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          user={userToDelete}
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  );
});

export default UsersTable;