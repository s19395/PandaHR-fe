import React, { createContext, useState, useCallback, useContext } from 'react';

const AlertContext = createContext();

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ alert, setAlert, handleClose }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  return useContext(AlertContext);
};

export default AlertProvider;
