import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth } from '../helper/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import Logout from '../pages/Logout';
import Login from '../pages/Login';
import Content from '../components/core/Content';

import Employees from '../pages/Employees';
import * as React from 'react';
import ErrorPage from '../components/core/ErrorPage';
import Positions from '../pages/Positions';
import Contract from '../pages/Contracts';
import Timesheet from '../pages/Timesheets';

const Routes = () => {
  const { token } = useAuth();

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: '',
          element: <Content />
        },
        {
          path: '/profile',
          element: <div>User Profile</div>
        },
        {
          path: '/logout',
          element: <Logout />
        },
        {
          path: '/employees',
          element: <Employees />
        },
        {
          path: '/positions',
          element: <Positions />
        },
        {
          path: '/contracts',
          element: <Contract />
        },
        {
          path: '/timesheet',
          element: <Timesheet />
        }
      ],
      errorElement: <ErrorPage />
    }
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: '/login',
      element: <Login />
    }
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly
  ]);

  // Provide the router configuration using RouterProvider
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default Routes;
