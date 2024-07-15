import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import EmployeeSearch from './EmployeeSearch';
import ContractsTable from './ContractsTable';

const EmployeeContractsPage = () => {
  const [employee, setEmployee] = useState();

  const handleEmployeeSelect = (employee) => {
    console.log('Selected Employee:', employee);
    setEmployee(employee);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
        </Grid>
        <Grid item xs={12}>
          {employee ? (
            <Box sx={{ pt: 2 }}>
              <ContractsTable employee={employee} />
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }} variant="h6" align="center">
              Wyszukaj pracownika, aby zobaczyć jego umowy
            </Typography>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EmployeeContractsPage;
