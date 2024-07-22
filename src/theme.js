'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiPaper: {
      defaultProps: {
        sx: {
          backgroundImage: 'none'
        }
      },
      styleOverrides: {
        elevation0: {
          backgroundImage: 'none',
          backgroundColor: '#181a1b'
        },
        elevation1: {
          backgroundImage: 'none',
          backgroundColor: '#1b1d1e'
        },
        elevation2: {
          backgroundImage: 'none',
          backgroundColor: '#1b1d1e'
        },
        elevation3: {
          backgroundImage: 'none',
          backgroundColor: '#181a1b'
        }
      }
    }
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#851d97',
      dark: '#571662'
    },
    background: {
      default: '#181a1b',
      paper: '#1b1d1e'
    },
    secondary: {
      main: '#d47fe3',
      dark: '#571662'
    },
    text: {
      primary: '#cdcbc9',
      secondary: '#cdcbc9'
    }
  }
});

export default theme;
