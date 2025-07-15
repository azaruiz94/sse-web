import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { updateRole } from '../../store/slices/rolesSlice';
import { fetchPermissions } from '../../store/slices/permissionsSlice';

const PERMISSION_GROUPS = [
  { label: 'Usuarios', keyword: 'USUARIO' },
  { label: 'Roles', keyword: 'ROL' },
  { label: 'Solicitantes', keyword: 'SOLICITANTE' },
  { label: 'Estados', keyword: 'ESTADO' },
  { label: 'Dependencias', keyword: 'DEPENDENCIA' },
  { label: 'Expedientes', keyword: 'EXPEDIENTE' },
  { label: 'Resoluciones', keyword: 'RESOLUCION' },
  { label: 'Auditoria', keyword: 'AUDITORIA' },
  { label: 'Other', keyword: null }
];

const groupPermissions = (permissions) => {
  const grouped = {};
  PERMISSION_GROUPS.forEach(group => {
    grouped[group.label] = [];
  });
  permissions.forEach(perm => {
    const foundGroup = PERMISSION_GROUPS.find(
      group => group.keyword && perm.name.toUpperCase().includes(group.keyword)
    );
    if (foundGroup) {
      grouped[foundGroup.label].push(perm);
    } else {
      grouped['Other'].push(perm);
    }
  });
  return grouped;
};

const toSentenceCase = (str) => {
  return str
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const EditRoleModal = ({ open, onClose, role }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const permissions = useSelector((state) => state.permissions.list);
  const user = useSelector((state) => state.auth.user);

  const hasVerPermisos = user?.permissions?.includes('VER_PERMISOS');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    permissionIds: []
  });

  useEffect(() => {
    if (open && hasVerPermisos) {
      dispatch(fetchPermissions());
    }
  }, [dispatch, open, hasVerPermisos]);

  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
        permissionIds: Array.isArray(role.permissionIds) ? role.permissionIds : []
      });
    }
  }, [role]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePermissionChange = (id) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(updateRole(formData)).unwrap();
      enqueueSnackbar('Role updated successfully', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err || 'Failed to update role', { variant: 'error' });
    }
  };

  const groupedPermissions = groupPermissions(permissions);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Role</DialogTitle>
      <DialogContent dividers>
        {!hasVerPermisos && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver los permisos. Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            disabled={!hasVerPermisos}
          />
          {hasVerPermisos && PERMISSION_GROUPS.map(group => (
            groupedPermissions[group.label].length > 0 && (
              <Box key={group.label} mb={2}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {group.label}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container columnSpacing={4}>
                  {groupedPermissions[group.label].map(perm => (
                    <Grid key={perm.id} size={{ xs: 12, sm: 4, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissionIds.includes(perm.id)}
                            onChange={() => handlePermissionChange(perm.id)}
                          />
                        }
                        label={toSentenceCase(perm.name)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!hasVerPermisos}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRoleModal;