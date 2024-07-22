import React from 'react';
import Routes from './routes';
import AlertSnackbar from './components/core/AlertSnackbar';
import AlertProvider from './helper/AlertProvider';
import { Paper } from '@mui/material';

export default function App() {
  return (
    <AlertProvider>
      <AlertSnackbar />
      <Paper>
        <Paper elevation={0} sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
          <Routes />
        </Paper>
      </Paper>
    </AlertProvider>
  );
}
