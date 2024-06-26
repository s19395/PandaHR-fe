import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth } from '../helper/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import Logout from '../pages/Logout';
import Login from '../pages/Login';
import Core from '../components/core/Core';

const Routes = () => {
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: '/service',
      element: <div>Service Page</div>
    },
    {
      path: '/about-us',
      element: <div>About Us</div>
    }
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: '',
          element: <Core />
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
          path: '/content',
          element: <Core />
        }
      ]
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
    ...routesForPublic,
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
