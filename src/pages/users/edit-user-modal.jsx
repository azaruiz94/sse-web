import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/usersSlice';

const EditUserModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const roles = useSelector((state) => state.roles.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const authUser = useSelector((state) => state.auth.user);

  const hasVerRol = authUser?.permissions?.includes('VER_ROL');
  const hasVerDependencia = authUser?.permissions?.includes('VER_DEPENDENCIA');

  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    roleIds: [],
    dependencyId: '',
    enabled: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        roleIds: Array.isArray(user.roleIds) ? user.roleIds : [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      await dispatch(updateUser(formData)).unwrap();
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err || 'Failed to update user', { variant: 'error' });
    }
  };

  const showAlert = !hasVerRol || !hasVerDependencia;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent dividers>
        {showAlert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver
            {!hasVerRol && !hasVerDependencia
              ? ' roles ni dependencias'
              : !hasVerRol
              ? ' roles'
              : ' dependencias'}
            . Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Correo"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Nro. Documento"
            name="document"
            value={formData.document}
            onChange={handleChange}
            fullWidth
          />
          {hasVerRol && (
            <FormControl fullWidth>
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
          )}
          {hasVerDependencia && (
            <TextField
              select
              label="Dependencia"
              name="dependencyId"
              value={formData.dependencyId}
              onChange={handleChange}
              fullWidth
            >
              {dependencies.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <FormControl component="fieldset">
            <Typography component="legend" sx={{ mb: 1 }}>
              Enabled
            </Typography>
            <RadioGroup
              row
              name="enabled"
              value={formData.enabled ? 'true' : 'false'}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  enabled: e.target.value === 'true'
                }))
              }
            >
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;