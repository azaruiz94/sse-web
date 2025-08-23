import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CircularProgress, Box, Alert } from '@mui/material';
import { logout } from 'store/slices/authSlice';

const PrivateRoute = ({ children, permission }) => {
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);
  const serverDown = useSelector(state => state.auth.serverDown);
  const sessionExpired = useSelector(state => state.auth.sessionExpired);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired) {
      dispatch(logout());
      navigate('/login');
    }
  }, [sessionExpired, dispatch, navigate]);

  if (serverDown) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">
          No se pudo conectar con el servidor. Por favor, intente más tarde.
        </Alert>
      </Box>
    );
  }

  // Redirect immediately if no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Show spinner while loading user info
  if (loading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Permission check
  if (permission && !user.permissions?.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
