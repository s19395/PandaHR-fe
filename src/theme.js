'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#34207d'
    },
    secondary: {
      main: '#6D1B7B'
    },
    background: {
      default: '#fafafa',
      paper: '#fafafa'
    },
    divider: 'rgba(0,0,0,0.3)'
  }
});

export default theme;
