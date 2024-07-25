import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const AlertContext = createContext();

const AlertService = ({ children }) => {
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ alert, setAlert, handleClose }), [alert, setAlert, handleClose]);

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

AlertService.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAlert = () => {
  return useContext(AlertContext);
};

export default AlertService;
