// src/pages/Contract.js
import * as React from 'react';
import EmployeeSearch from './EmployeeSearch';
import { useState } from 'react';
import ContractsTable from './ContractsTable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Contract = () => {
  const [employee, setEmployee] = useState(null);

  const handleEmployeeSelect = (employee) => {
    console.log('Selected Employee:', employee);
    setEmployee(employee);
  };

  return (
    <>
      <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
      {employee ? (
        <Box sx={{ pt: 2 }}>
          <ContractsTable employee={employee} />
        </Box>
      ) : (
        <Typography sx={{ mt: 2 }} variant="h6">
          Wyszukaj pracownika, aby zobaczyć jego umowy
        </Typography>
      )}
    </>
  );
};

export default Contract;
