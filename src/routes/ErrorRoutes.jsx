import { Navigate } from 'react-router-dom';
import Forbidden from '../pages/errors/403';

const ErrorRoutes = [
  {
    path: '/403',
    element: <Forbidden />
  },
  // Optionally, add a catch-all for 404
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
];

export default ErrorRoutes;