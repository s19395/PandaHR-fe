import { useRouteError } from 'react-router-dom';
import Box from '@mui/material/Box';
import * as React from 'react';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </Box>
  );
}
