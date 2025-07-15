import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, permission }) => {
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading); // Add this if you have a loading flag

  // If you have a loading flag in your auth slice
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // If user is not loaded yet (no loading flag)
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !user.permissions?.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
