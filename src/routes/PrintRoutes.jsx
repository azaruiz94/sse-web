import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import PrintLayout from 'layout/Print';
import PrivateRoute from './PrivateRoute';

// print pages
const PrintResolutionPage = Loadable(lazy(() => import('pages/resolutions/print-resolution-page')));

// ==============================|| PRINT ROUTING ||============================== //

const PrintRoutes = {
  path: '/print',
  element: <PrintLayout />,
  children: [
    {
      path: 'resoluciones/:id',
      element: (
        <PrivateRoute permission="VER_RESOLUCION">
          <PrintResolutionPage />
        </PrivateRoute>
      )
    }
  ]
};

export default PrintRoutes;