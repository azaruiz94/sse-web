import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, permission }) => {
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);

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
