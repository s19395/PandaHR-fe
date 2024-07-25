import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useAlert } from '../../service/AlertService';

const AlertSnackbar = () => {
  const { alert, handleClose } = useAlert();

  return (
    <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;
