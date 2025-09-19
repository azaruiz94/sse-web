import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PrivateRoute from './PrivateRoute';


// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
// const Color = Loadable(lazy(() => import('pages/component-overview/color')));
// const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
// const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const EntrancePage = Loadable(lazy(() => import('pages/entrance/entrance-page')));
const ApplicantsPage = Loadable(lazy(() => import('pages/applicants/applicants-page')));
const TemplatesPage = Loadable(lazy(() => import('pages/templates/templates-page')));
const CreateTemplatePage = Loadable(lazy(() => import('pages/templates/create-template-page')));
const ShowTemplatePage = Loadable(lazy(() => import('pages/templates/show-template-page')));
const EditTemplatePage = Loadable(lazy(() => import('pages/templates/edit-template-page')));
const StatesPage = Loadable(lazy(() => import('pages/states/states-page')));
const DependenciesPage = Loadable(lazy(() => import('pages/dependencies/dependencies-page')));
const UsersPage = Loadable(lazy(() => import('pages/users/users-page')));
const RolesPage = Loadable(lazy(() => import('pages/roles/roles-page')));
const RecordsPage = Loadable(lazy(() => import('pages/records/records-page')));
const CreateRecordPage = Loadable(lazy(() => import('pages/records/create-record-page')));
const ShowRecordPage = Loadable(lazy(() => import('pages/records/show-record-page')));
const ResolutionsPage = Loadable(lazy(() => import('pages/resolutions/resolutions-page')));
const CreateResolutionPage = Loadable(lazy(() => import('pages/resolutions/create-resolution-page')));
const ShowResolutionPage = Loadable(lazy(() => import('pages/resolutions/show-resolution-page')));
const EditResolutionPage = Loadable(lazy(() => import('pages/resolutions/edit-resolution-page')));
const AuditPage = Loadable(lazy(() => import('pages/audit/audit-page')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <PrivateRoute>
      <DashboardLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    // {
    //   path: 'typography',
    //   element: <Typography />
    // },
    // {
    //   path: 'color',
    //   element: <Color />
    // },
    // {
    //   path: 'shadow',
    //   element: <Shadow />
    // },
    // {
    //   path: 'sample-page',
    //   element: <SamplePage />
    // },
    {
      path: 'mesa-entrada',
      element: <EntrancePage />
    },
    {
      path: 'solicitantes',
      element: (
        <PrivateRoute permission="VER_SOLICITANTE">
          <ApplicantsPage />
        </PrivateRoute>
      )
    },
    {
      path: 'expedientes',
      element: (
        <PrivateRoute permission="VER_EXPEDIENTE">
          <RecordsPage />
        </PrivateRoute>
      )
    },
    {
      path: 'expedientes/create',
      element: (
        <PrivateRoute permission="CREAR_EXPEDIENTE">
          <CreateRecordPage />
        </PrivateRoute>
      )
    },
    {
      path: 'expedientes/:id',
      element: (
        <PrivateRoute permission="VER_EXPEDIENTE">
          <ShowRecordPage />
        </PrivateRoute>
      )
    },
    {
      path: 'resoluciones',
      element: (
        <PrivateRoute permission="VER_RESOLUCION">
          <ResolutionsPage />
        </PrivateRoute>
      )
    },
    {
      path: 'resoluciones/create',
      element: (
        <PrivateRoute permission="CREAR_RESOLUCION">
          <CreateResolutionPage />
        </PrivateRoute>
      )
    },
    {
      path: 'resoluciones/:id',
      element: (
        <PrivateRoute permission="VER_RESOLUCION">
          <ShowResolutionPage />
        </PrivateRoute>
      )
    },
    {
      path: 'resoluciones/:id/edit',
      element: (
        <PrivateRoute permission="EDITAR_RESOLUCION">
          <EditResolutionPage />
        </PrivateRoute>
      )
    },
    {
      path: 'templates',
      element: (
        <PrivateRoute permission="VER_RESOLUCION">
          <TemplatesPage />
        </PrivateRoute>
      )
    },
    {
      path: 'templates/create',
      element: (
        <PrivateRoute permission="CREAR_RESOLUCION">
          <CreateTemplatePage />
        </PrivateRoute>
      )
    },
    {
      path: 'templates/:id',
      element: (
        <PrivateRoute permission="VER_RESOLUCION">
          <ShowTemplatePage />
        </PrivateRoute>
      )
    },
    {
      path: 'templates/:id/edit',
      element: (
        <PrivateRoute permission="EDITAR_RESOLUCION">
          <EditTemplatePage />
        </PrivateRoute>
      )
    },
    {
      path: 'estados',
      element: (
        <PrivateRoute permission="VER_ESTADO">
          <StatesPage />
        </PrivateRoute>
      )
    },
    {
      path: 'dependencias',
      element: (
        <PrivateRoute permission="VER_DEPENDENCIA">
          <DependenciesPage />
        </PrivateRoute>
      )
    },
    {
      path: 'usuarios',
      element: (
        <PrivateRoute permission="VER_USUARIO">
          <UsersPage />
        </PrivateRoute>
      )
    },
    {
      path: 'roles',
      element: (
        <PrivateRoute permission="VER_ROL">
          <RolesPage />
        </PrivateRoute>
      )
    },
    {
      path: 'auditoria',
      element: (
        <PrivateRoute permission="VER_AUDITORIA">
          <AuditPage />
        </PrivateRoute>
      )
    }
  ]
};

export default MainRoutes;
