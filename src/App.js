import React from 'react';
import Box from '@mui/material/Box';
import Routes from './routes';
import AlertSnackbar from './components/core/AlertSnackbar';
import AlertProvider from './helper/AlertProvider';

export default function App() {
  return (
    <AlertProvider>
      <AlertSnackbar />
      <Box sx={{ display: 'flex' }}>
        <Routes />
      </Box>
    </AlertProvider>
  );
}
