import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../helper/AuthProvider';
import AppDrawer from '../components/core/AppDrawer';
import * as React from 'react';
import Box from '@mui/material/Box';

export const ProtectedRoute = () => {
  const { token } = useAuth();

  // Check if the user is authenticated
  if (!token) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes
  return (
    <>
      <AppDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        <Outlet />
      </Box>
    </>
  );
};
