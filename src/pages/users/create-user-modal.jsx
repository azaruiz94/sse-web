import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '../../store/slices/usersSlice';

const CreateUserModal = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.roles.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const user = useSelector((state) => state.auth.user);

  // Permission checks
  const hasVerRol = user?.permissions?.includes('VER_ROL');
  const hasVerDependencia = user?.permissions?.includes('VER_DEPENDENCIA');

  // Only fetch roles/dependencies if user has permissions
  useEffect(() => {
    if (open && hasVerRol) {
      // dispatch(fetchRoles()); // Uncomment if you fetch roles here
    }
    if (open && hasVerDependencia) {
      // dispatch(fetchDependencies()); // Uncomment if you fetch dependencies here
    }
  }, [open, hasVerRol, hasVerDependencia, dispatch]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    email: '',
    phone: '',
    document: '',
    dependencyId: '',
    roleIds: [],
    enabled: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRolesChange = (event) => {
    const {
      target: { value }
    } = event;
    setFormData(prev => ({
      ...prev,
      roleIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createUser(formData)).unwrap();
      enqueueSnackbar('User created successfully', { variant: 'success' });
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        phone: '',
        document: '',
        dependencyId: '',
        roleIds: [],
        enabled: true
      }); // reset
    } catch (err) {
      enqueueSnackbar(err || 'Failed to create user', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent dividers>
        {(!hasVerRol || !hasVerDependencia) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver roles o dependencias. Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Document"
            name="document"
            value={formData.document}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth disabled={!hasVerRol}>
            <InputLabel id="roles-multiselect-label">Roles</InputLabel>
            <Select
              labelId="roles-multiselect-label"
              multiple
              name="roleIds"
              value={formData.roleIds}
              onChange={handleRolesChange}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) =>
                roles
                  .filter((role) => selected.includes(role.id))
                  .map((role) => role.name)
                  .join(', ')
              }
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Checkbox checked={formData.roleIds.indexOf(role.id) > -1} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            select
            label="Dependency"
            name="dependencyId"
            value={formData.dependencyId}
            onChange={handleChange}
            fullWidth
            disabled={!hasVerDependencia}
          >
            {dependencies.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!hasVerRol || !hasVerDependencia}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;
