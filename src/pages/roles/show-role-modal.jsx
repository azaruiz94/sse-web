import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/usersSlice';
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

const ShowRoleModal = ({ open, onClose, role }) => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);
  const permissions = useSelector((state) => state.permissions.list);
  const user = useSelector((state) => state.auth.user);

  const hasVerPermisos = user?.permissions?.includes('VER_PERMISOS');

  // Fetch users if not loaded when modal opens
  useEffect(() => {
    if (open && users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [open, users.length, dispatch]);

  // Fetch permissions if not loaded when modal opens
  useEffect(() => {
    if (open && permissions.length === 0 && hasVerPermisos) {
      dispatch(fetchPermissions());
    }
  }, [open, permissions.length, dispatch, hasVerPermisos]);

  // Find users that have this role
  const usersWithRole = role
    ? users.filter(u => Array.isArray(u.roleIds) && u.roleIds.includes(role.id))
    : [];

  // Only show permissions that the role has
  const rolePermissions = permissions.filter(
    perm => Array.isArray(role?.permissionIds) && role.permissionIds.includes(perm.id)
  );
  const groupedPermissions = groupPermissions(rolePermissions);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Role Permissions</DialogTitle>
      <DialogContent dividers>
        {!hasVerPermisos && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver los permisos. Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {role?.name}
          </Typography>
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
                            checked
                            disabled
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
          <Typography sx={{ mt: 2 }}><strong>Users with this role:</strong></Typography>
          {usersWithRole.length > 0 ? (
            <List dense>
              {usersWithRole.map(user => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={
                      (user.firstName || user.lastName)
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : user.email
                    }
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ ml: 2 }}>No users assigned to this role.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowRoleModal;