import { lazy } from 'react';

// project imports
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));
const ResetPasswordPage = Loadable(lazy(() => import('pages/auth/ResetPassword')));
const TwoFaPage = Loadable(lazy(() => import('pages/auth/TwoFa')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login', // <-- remove leading slash
      element: <LoginPage />
    },
    // {
    //   path: 'register', // <-- remove leading slash
    //   element: <RegisterPage />
    // },
    {
      path: 'reset-password',
      element: <ResetPasswordPage />
    }
    ,
    {
      path: 'twofa',
      element: <TwoFaPage />
    }
  ]
};

export default LoginRoutes;
