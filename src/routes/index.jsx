import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import PrintRoutes from './PrintRoutes';
import ErrorRoutes from './ErrorRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [MainRoutes, LoginRoutes, PrintRoutes, ...ErrorRoutes],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
