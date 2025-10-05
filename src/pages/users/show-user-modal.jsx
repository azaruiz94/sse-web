import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { activateUser, deactivateUser, requestPasswordReset } from '../../store/slices/usersSlice';
import { useState } from 'react';

const ShowUserModal = ({ open, onClose, user }) => {
  const roles = useSelector((state) => state.roles.list);
  const dependencies = useSelector((state) => state.dependencies.list);
  const authUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const canToggleEnabled = authUser?.permissions?.includes('ACTIVAR_USUARIO') || authUser?.permissions?.includes('DESACTIVAR_USUARIO');
  const canRequestReset = authUser?.permissions?.includes('RESETEAR_CONTRASENA');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleToggleClick = () => {
    setConfirmAction(user?.enabled ? 'deactivate' : 'activate');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!user) return;
    try {
      setActionLoading(true);
      if (confirmAction === 'activate') {
        const resp = await dispatch(activateUser(user.id)).unwrap();
        enqueueSnackbar(resp?.message || 'Usuario activado', { variant: 'success' });
      } else {
        const resp = await dispatch(deactivateUser(user.id)).unwrap();
        enqueueSnackbar(resp?.message || 'Usuario desactivado', { variant: 'success' });
      }
    } catch (err) {
      enqueueSnackbar(err || 'Acción fallida', { variant: 'error' });
    } finally {
      setConfirmOpen(false);
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Detalles de Usuario</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user && (
            <Button
              color={user.enabled ? 'error' : 'success'}
              variant="outlined"
              onClick={handleToggleClick}
              disabled={!canToggleEnabled || actionLoading}
              startIcon={actionLoading ? <CircularProgress size={18} /> : null}
            >
              {user.enabled ? 'Desactivar' : 'Activar'}
            </Button>
          )}
          {user && canRequestReset && (
            <Button
              color="primary"
              variant="outlined"
              onClick={() => setResetConfirmOpen(true)}
              disabled={resetLoading}
              startIcon={resetLoading ? <CircularProgress size={18} /> : null}
            >
              Resetear Contraseña
            </Button>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {showAlert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No tienes permiso para ver{!hasVerRol && !hasVerDependencia ? ' roles ni dependencias' : !hasVerRol ? ' roles' : ' dependencias'}.
            Si crees que esto es un error, contacta al administrador.
          </Alert>
        )}
        {user ? (
          <Box>
            <Typography><strong>Nombre:</strong> {user.firstName}</Typography>
            <Typography><strong>Apellido:</strong> {user.lastName}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Teléfono:</strong> {user.phone}</Typography>
            <Typography><strong>Documento:</strong> {user.document}</Typography>
            {hasVerRol && (
              <Typography><strong>Roles:</strong> {roleNames}</Typography>
            )}
            {hasVerDependencia && (
              <Typography><strong>Dependencia:</strong> {dependencyName}</Typography>
            )}
            <Typography><strong>Activado:</strong> {user.enabled ? 'Sí' : 'No'}</Typography>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cerrar</Button>
      </DialogActions>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {confirmAction === 'activate' ? 'Activar usuario' : 'Desactivar usuario'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            {confirmAction === 'activate'
              ? `¿Estás seguro de que deseas activar al usuario ${user?.firstName || ''} ${user?.lastName || ''}?`
              : `¿Estás seguro de que deseas desactivar al usuario ${user?.firstName || ''} ${user?.lastName || ''}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={actionLoading}>Cancelar</Button>
          <Button variant="contained" color={confirmAction === 'activate' ? 'success' : 'error'} onClick={handleConfirm} disabled={actionLoading} startIcon={actionLoading ? <CircularProgress size={18} /> : null}>
            {confirmAction === 'activate' ? 'Activar' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Reset confirmation dialog */}
      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)}>
        <DialogTitle>Restablecer contraseña</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Se enviará un enlace de restablecimiento de contraseña al correo electrónico del usuario: <strong>{user?.email}</strong>. ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)} disabled={resetLoading}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                setResetLoading(true);
                const resp = await dispatch(requestPasswordReset(user.email)).unwrap();
                enqueueSnackbar(resp?.message || 'Se envió la solicitud de restablecimiento de contraseña', { variant: 'success' });
              } catch (err) {
                enqueueSnackbar(err || 'Fallo al solicitar restablecimiento de contraseña', { variant: 'error' });
              } finally {
                setResetLoading(false);
                setResetConfirmOpen(false);
              }
            }}
            disabled={resetLoading}
            startIcon={resetLoading ? <CircularProgress size={18} /> : null}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ShowUserModal;