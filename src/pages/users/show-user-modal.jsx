import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';

const ShowUserModal = ({ open, onClose, user }) => {
  const roles = useSelector((state) => state.roles.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const authUser = useSelector((state) => state.auth.user);

  const hasVerRol = authUser?.permissions?.includes('VER_ROL');
  const hasVerDependencia = authUser?.permissions?.includes('VER_DEPENDENCIA');

  let roleNames = '-';
  let dependencyName = '-';

  if (user) {
    if (Array.isArray(user.roleIds) && user.roleIds.length > 0 && hasVerRol) {
      const names = user.roleIds
        .map(id => {
          const role = roles.find(r => String(r.id) === String(id));
          return role ? role.name : id;
        })
        .filter(Boolean);
      roleNames = names.length ? names.join(', ') : '-';
    }
    if (hasVerDependencia) {
      const dep = dependencies.find(d => String(d.id) === String(user.dependencyId));
      if (dep) dependencyName = dep.name;
    }
  }

  const showAlert = !hasVerRol || !hasVerDependencia;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Details</DialogTitle>
      <DialogContent dividers>
        {showAlert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver{!hasVerRol && !hasVerDependencia ? ' roles ni dependencias' : !hasVerRol ? ' roles' : ' dependencias'}.
            Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        {user ? (
          <Box>
            <Typography><strong>ID:</strong> {user.id}</Typography>
            <Typography><strong>First Name:</strong> {user.firstName}</Typography>
            <Typography><strong>Last Name:</strong> {user.lastName}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Phone:</strong> {user.phone}</Typography>
            <Typography><strong>Document:</strong> {user.document}</Typography>
            {hasVerRol && (
              <Typography><strong>Roles:</strong> {roleNames}</Typography>
            )}
            {hasVerDependencia && (
              <Typography><strong>Dependency:</strong> {dependencyName}</Typography>
            )}
            <Typography><strong>Enabled:</strong> {user.enabled ? 'Yes' : 'No'}</Typography>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowUserModal;