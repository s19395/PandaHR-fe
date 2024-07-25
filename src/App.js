import React from 'react';
import Routes from './routes';
import AlertSnackbar from './components/core/AlertSnackbar';
import AlertService from './service/AlertService';
import { Paper } from '@mui/material';

export default function App() {
  return (
    <AlertService>
      <AlertSnackbar />
      <Paper>
        <Paper elevation={0} sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
          <Routes />
        </Paper>
      </Paper>
    </AlertService>
  );
}
